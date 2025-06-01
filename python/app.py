from flask import Flask, render_template, Response, jsonify
import cv2
import numpy as np
import face_recognition
import datetime
import os
import pymongo
import base64
import io
from PIL import Image
from ultralytics import YOLO
import easyocr
import threading
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize models
general_model = YOLO('yolov8n.pt')  # General object detection
plate_model = YOLO('yolov8n-seg.pt')  # For license plate detection

# Initialize license plate reader
reader = easyocr.Reader(['en'])

# MongoDB connection
client = pymongo.MongoClient("mongodb+srv://parmarth:parmarth12@cluster0.gpsushu.mongodb.net")
db = client["smart_security_tracker"]
users_collection = db["users"]
detection_logs_collection = db["detectionlogs"]
notification_logs_collection = db["notificationlogs"]

# Global variables
camera = None
output_frame = None
lock = threading.Lock()
detection_active = False

def get_user_face_data():
    """Load face recognition data from MongoDB"""
    print("📡 Connecting to MongoDB for face data...")
    users = users_collection.find({}, {"name": 1, "branch": 1, "rollNo": 1, "images": 1})
    
    known_face_encodings = []
    known_face_names = []
    user_details = {}
    
    for user in users:
        name = user.get("name", "Unknown")
        branch = user.get("branch", "Unknown")
        roll_no = user.get("rollNo", "Unknown")
        
        if "images" in user and user["images"]:
            for img_data in user["images"]:
                try:
                    if "data" in img_data:
                        base64_data = img_data["data"]
                        # Remove data:image prefix if present
                        if "," in base64_data:
                            base64_data = base64_data.split(",")[1]
                        
                        image_bytes = base64.b64decode(base64_data)
                        img = Image.open(io.BytesIO(image_bytes))
                        img_array = np.array(img)

                        face_locations = face_recognition.face_locations(img_array)
                        if face_locations:
                            face_encoding = face_recognition.face_encodings(img_array, face_locations)[0]
                            known_face_encodings.append(face_encoding)
                            known_face_names.append(name)
                            user_details[name] = {"branch": branch, "rollNo": roll_no}
                            print(f"✅ Loaded face data for: {name}")
                        else:
                            print(f"⚠️ No face found in image for: {name}")
                    else:
                        print(f"⚠️ Invalid image format for user: {name}")
                except Exception as e:
                    print(f"❌ Error processing image for {name}: {str(e)}")
    
    print(f"✅ Loaded {len(known_face_encodings)} face encodings for {len(set(known_face_names))} users")
    return known_face_encodings, known_face_names, user_details

def read_license_plate(plate_img):
    """Read text from license plate image"""
    if plate_img is None or plate_img.size == 0:
        return None
    
    # Resize for better OCR results
    plate_img = cv2.resize(plate_img, (0, 0), fx=2, fy=2)
    
    # Convert to grayscale
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    
    # Apply threshold
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Denoise
    binary = cv2.fastNlMeansDenoising(binary, None, 10, 7, 21)
    
    # Read text using EasyOCR
    results = reader.readtext(binary)
    
    # Extract and combine text
    plate_text = ""
    for (_, text, prob) in results:
        if prob > 0.5:
            plate_text += text
    
    # Clean up the text
    plate_text = ''.join(e for e in plate_text if e.isalnum())
    
    return plate_text.upper() if plate_text else None

def check_plate_registration(plate_number):
    """Check if a license plate is registered in the database"""
    user = users_collection.find_one({"vehicle.plateNumber": plate_number})
    return user

def log_access(name, status, confidence=None, plate_number=None, image_base64=None, objects_detected=None):
    """Log access attempts to MongoDB using the provided schemas"""
    
    # Create detection log
    detection_log = {
        "timestamp": datetime.datetime.now(),
        "personDetected": name is not None,
        "plateDetected": plate_number is not None,
        "name": name if name != "Unknown" else None,
        "rollNo": None,  # Will be updated if user is found
        "plateNumber": plate_number,
        "image": image_base64,
        "objectDetected": objects_detected or [],
        "authenticated": status == "authorized"
    }
    
    # If authorized, get roll number from users collection
    if status == "authorized" and name != "Unknown":
        user = users_collection.find_one({"name": name})
        if user:
            detection_log["rollNo"] = user.get("rollNo")
    
    # Insert detection log
    detection_logs_collection.insert_one(detection_log)
    
    # Create notification log for unauthorized access
    if status == "unauthorized":
        reason = "Unknown Face" if name == "Unknown" and not plate_number else "Unauthorized Vehicle" if plate_number else "Unknown Person"
        
        notification_log = {
            "timestamp": datetime.datetime.now(),
            "reason": reason,
            "image": image_base64,
            "details": {
                "face": name == "Unknown",
                "plate": plate_number is not None,
                "matched": False
            }
        }
        
        notification_logs_collection.insert_one(notification_log)
    
    print(f"📝 Logged {status} access for {name or plate_number}")

def detect_and_recognize():
    """Main detection and recognition function"""
    global output_frame, detection_active, camera, lock
    
    # Load face recognition data
    known_face_encodings, known_face_names, user_details = get_user_face_data()
    
    # Initialize camera
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

    
    if not camera.isOpened():
        print("❌ Error: Could not open camera.")
        return
    
    # For performance optimization
    process_this_frame = True
    recently_logged = {}
    
    # Define colors
    GREEN = (0, 255, 0)
    RED = (0, 0, 255)
    BLUE = (255, 0, 0)

    # For capturing images for logs
    def get_frame_base64(frame):
        """Convert frame to base64 for storage in MongoDB"""
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        return base64.b64encode(buffer).decode('utf-8')
    
    while detection_active:
        success, frame = camera.read()
        if not success:
            print("❌ Error: Failed to capture image from camera")
            break
        
        # Make a copy for display
        display_frame = frame.copy()
        
        # Process face recognition (on every other frame for performance)
        if process_this_frame:
            # Resize frame for faster face recognition processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Find all faces in the current frame
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                # Scale back up face locations
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4
                
                # Compare with known faces
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
                name = "Unknown"
                status = "unauthorized"
                confidence = None
                
                # Calculate face distance (lower is better match)
                if known_face_encodings:
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)
                    confidence = 1 - face_distances[best_match_index]
                    
                    if matches[best_match_index]:
                        name = known_face_names[best_match_index]
                        status = "authorized"
                
                # Choose color based on status
                color = GREEN if status == "authorized" else RED
                
                # Draw a box around the face
                cv2.rectangle(display_frame, (left, top), (right, bottom), color, 2)
                
                # Draw a label with a name below the face
                cv2.rectangle(display_frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                
                # Add text with name
                font = cv2.FONT_HERSHEY_DUPLEX
                conf_text = f" ({confidence:.2f})" if confidence else ""
                
                if status == "authorized":
                    user_info = user_details.get(name, {})
                    branch = user_info.get("branch", "")
                    roll_no = user_info.get("rollNo", "")
                    
                    # Display name
                    cv2.putText(display_frame, name + conf_text, (left + 6, bottom - 15), font, 0.5, (255, 255, 255), 1)
                    
                    # Display additional info above the face
                    info_text = f"Branch: {branch}, Roll: {roll_no}"
                    cv2.putText(display_frame, info_text, (left, top - 10), font, 0.5, color, 1)
                else:
                    cv2.putText(display_frame, "UNAUTHORIZED" + conf_text, (left + 6, bottom - 15), font, 0.5, (255, 255, 255), 1)

                # Capture image for logging
                face_img = frame[top:bottom, left:right]
                face_img_base64 = get_frame_base64(face_img) if face_img.size > 0 else None
                
                # Log access with rate limiting (once per minute per person)
                current_time = datetime.datetime.now()
                if name not in recently_logged or (current_time - recently_logged[name]).total_seconds() > 60:
                    log_access(name, status, confidence, None, face_img_base64)
                    recently_logged[name] = current_time
        
        # Process object detection (every frame)
        # Detect objects in the frame
        results = general_model(frame)
        
        # Process each detection
        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # Get class name
                class_name = general_model.names[cls]
                
                # Draw blue box around ALL detected objects
                cv2.rectangle(display_frame, (x1, y1), (x2, y2), BLUE, 2)
                cv2.putText(display_frame, f"{class_name}: {conf:.2f}", (x1, y1-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, BLUE, 2)
                
                # Only process vehicles for license plate detection
                if class_name in ['car', 'motorcycle', 'truck', 'bus'] and conf > 0.5:
                    # Extract the vehicle from the frame
                    vehicle_img = frame[y1:y2, x1:x2]
                    
                    # Run license plate detection on the vehicle crop
                    plate_results = plate_model(vehicle_img)
                    
                    for plate_result in plate_results:
                        plate_boxes = plate_result.boxes.cpu().numpy()
                        
                        for plate_box in plate_boxes:
                            # Get plate coordinates
                            px1, py1, px2, py2 = map(int, plate_box.xyxy[0])
                            plate_conf = float(plate_box.conf[0])
                            
                            if plate_conf > 0.4:  # Lower threshold for plates
                                # Extract plate image
                                plate_img = vehicle_img[py1:py2, px1:px2]
                                
                                # Read plate text
                                plate_number = read_license_plate(plate_img)
                                
                                if plate_number:
                                    # Check if plate is registered
                                    user_info = check_plate_registration(plate_number)
                                    
                                    # Calculate plate coordinates in the original frame
                                    plate_x1 = x1 + px1
                                    plate_y1 = y1 + py1
                                    plate_x2 = x1 + px2
                                    plate_y2 = y1 + py2
                                    
                                    # Always display the plate number
                                    plate_text = f"Plate: {plate_number}"
                                    
                                    # Draw bounding box around license plate
                                    if user_info:
                                        # Registered vehicle - green box
                                        cv2.rectangle(display_frame, (plate_x1, plate_y1), (plate_x2, plate_y2), GREEN, 2)
                                        
                                        # Display owner information
                                        info_text = f"Owner: {user_info['name']}, Roll: {user_info['rollNo']}"
                                        vehicle_type = user_info['vehicle']['type']
                                        
                                        # Display information
                                        cv2.putText(display_frame, info_text, (plate_x1, plate_y2 + 20), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, GREEN, 2)
                                        cv2.putText(display_frame, f"Type: {vehicle_type}", (plate_x1, plate_y2 + 40), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, GREEN, 2)
                                        cv2.putText(display_frame, plate_text, (plate_x1, plate_y2 + 60), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, GREEN, 2)
                                        
                                        # Log authorized vehicle
                                        # Capture plate image for logging
                                        plate_img_base64 = get_frame_base64(plate_img) if plate_img.size > 0 else None
                                        
                                        # Get detected objects in the frame
                                        objects_detected = [general_model.names[int(b.cls[0])] for b in boxes]
                                        
                                        log_access(user_info['name'], "authorized", None, plate_number, plate_img_base64, objects_detected)
                                    else:
                                        # Unregistered vehicle - red box
                                        cv2.rectangle(display_frame, (plate_x1, plate_y1), (plate_x2, plate_y2), RED, 2)
                                        cv2.putText(display_frame, "UNAUTHORIZED ACCESS", (plate_x1, plate_y2 + 20), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, RED, 2)
                                        cv2.putText(display_frame, plate_text, (plate_x1, plate_y2 + 40), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, RED, 2)
                                        
                                        # Log unauthorized vehicle
                                        # Capture plate image for logging
                                        plate_img_base64 = get_frame_base64(plate_img) if plate_img.size > 0 else None
                                        
                                        # Get detected objects in the frame
                                        objects_detected = [general_model.names[int(b.cls[0])] for b in boxes]
                                        
                                        log_access("Unknown", "unauthorized", None, plate_number, plate_img_base64, objects_detected)
        
        # Toggle frame processing for face recognition
        process_this_frame = not process_this_frame
        
        # Update the output frame
        with lock:
            output_frame = display_frame.copy()
    
    # Release camera when done
    camera.release()

def generate_frames():
    """Generate frames for the video stream"""
    global output_frame, lock
    
    while True:
        with lock:
            if output_frame is None:
                continue
            
            # Encode the frame in JPEG format
            (flag, encoded_image) = cv2.imencode(".jpg", output_frame)
            
            if not flag:
                continue
        
        # Yield the output frame in byte format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encoded_image) + b'\r\n')
        
        # Add a small delay to control frame rate
        time.sleep(0.03)  # ~30 FPS

@app.route('/')
def index():
    """Render the home page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_detection', methods=['POST'])
def start_detection():
    """Start the detection and recognition process"""
    global detection_active
    
    if not detection_active:
        detection_active = True
        threading.Thread(target=detect_and_recognize).start()
        return jsonify({"status": "success", "message": "Detection started"})
    else:
        return jsonify({"status": "info", "message": "Detection already running"})

@app.route('/stop_detection', methods=['POST'])
def stop_detection():
    """Stop the detection and recognition process"""
    global detection_active, camera
    
    if detection_active:
        detection_active = False
        # Camera will be released in the detect_and_recognize function
        return jsonify({"status": "success", "message": "Detection stopped"})
    else:
        return jsonify({"status": "info", "message": "Detection not running"})

@app.route('/get_logs')
def get_logs():
    """Get the latest access logs"""
    # Get detection logs
    detection_logs = list(detection_logs_collection.find().sort("timestamp", -1).limit(10))
    
    # Get notification logs
    notification_logs = list(notification_logs_collection.find().sort("timestamp", -1).limit(5))
    
    # Convert ObjectId to string for JSON serialization
    for log in detection_logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    
    for log in notification_logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    
    return jsonify({
        "detection_logs": detection_logs,
        "notification_logs": notification_logs
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)