# Security Monitoring System

A comprehensive security monitoring system that combines multiple technologies for robust surveillance and monitoring capabilities.

## Tech Stack

### Frontend (Client)
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS
  - PostCSS
- **UI Components**: 
  - Shadcn UI
  - Custom components
- **Development Tools**:
  - ESLint
  - TypeScript configuration
  - Next.js configuration

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Architecture**:
  - MVC Pattern (Models, Views, Controllers)
  - Middleware support
  - Route-based architecture
- **Directory Structure**:
  - `/controllers` - Business logic
  - `/models` - Data models
  - `/routes` - API endpoints
  - `/middlewares` - Custom middleware
  - `/utils` - Utility functions
  - `/config` - Configuration files

### Python Backend
- **Framework**: Flask
- **AI/ML Components**:
  - **Object Detection**:
    - YOLOv8 (You Only Look Once v8)
    - Pre-trained model: yolov8n.pt
    - Features:
      - Real-time object detection
      - Multiple object class detection
      - High accuracy and speed
      - Confidence thresholding
    - **Architecture**:
      - CNN (Convolutional Neural Network) based
      - Backbone: CSPDarknet
      - Neck: PANet (Path Aggregation Network)
      - Head: Decoupled Head
      - Activation: SiLU (Sigmoid Linear Unit)
      - Loss Functions:
        - Classification Loss: BCE Loss
        - Box Regression Loss: CIoU Loss
        - Objectness Loss: BCE Loss
  
  - **Instance Segmentation**:
    - YOLOv8n-seg model
    - Pre-trained model: yolov8n-seg.pt
    - Features:
      - Pixel-level segmentation
      - Object boundary detection
      - Instance-wise masking
      - Real-time segmentation
    - **Architecture**:
      - CNN-based segmentation head
      - Mask prediction branch
      - Feature Pyramid Network (FPN)
      - Loss Functions:
        - Mask Loss: BCE Loss
        - Dice Loss for mask refinement

  - **Computer Vision Libraries**:
    - OpenCV (cv2)
    - NumPy for array operations
    - PIL (Python Imaging Library)
    - Ultralytics YOLO framework

  - **Video Processing**:
    - Real-time video stream handling
    - Frame-by-frame analysis
    - Multi-threaded processing
    - Video capture and display

  - **ML Features**:
    - Real-time inference
    - Batch processing capability
    - Model optimization
    - GPU acceleration support
    - Custom confidence thresholds
    - Multiple object tracking

  - **Deep Learning Algorithms**:
    - **CNN Architectures**:
      - CSPDarknet (Cross Stage Partial Darknet)
      - Feature Pyramid Networks (FPN)
      - Path Aggregation Network (PANet)
    - **Optimization Techniques**:
      - Stochastic Gradient Descent (SGD)
      - Adam Optimizer
      - Learning Rate Scheduling
    - **Data Augmentation**:
      - Mosaic Augmentation
      - Random Scaling
      - Random Rotation
      - Color Jittering
    - **Model Components**:
      - Convolutional Layers
      - Batch Normalization
      - Residual Connections
      - SPP (Spatial Pyramid Pooling)
      - C2f (Cross Stage Partial Network)

## Project Structure
```
├── client/                 # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── styles/           # Global styles
│   └── public/           # Static assets
│
├── backend/              # Node.js backend
│   ├── controllers/      # Business logic
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middleware
│   └── utils/           # Utility functions
│
└── python/              # Python backend
    ├── templates/       # HTML templates
    ├── styles/         # CSS styles
    └── models/         # ML models
```

## Key Features
1. Real-time object detection
2. Instance segmentation
3. Modern responsive UI
4. RESTful API architecture
5. Type-safe development with TypeScript
6. Modular and scalable codebase

## Development Setup
1. Frontend (Client):
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. Backend (Node.js):
   ```bash
   cd backend
   npm install
   npm start
   ```

3. Python Backend:
   ```bash
   cd python
   pip install -r requirements.txt
   python app.py
   ```

## Dependencies
- Node.js
- Python 3.x
- npm/yarn
- pip

## Security Features
- Object detection for security monitoring
- Real-time video processing
- Instance segmentation for detailed analysis
- Secure API endpoints
- Modern authentication system

## Contributing
Please read the contribution guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details. 