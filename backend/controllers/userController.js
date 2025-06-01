

// export const registerUser = async (req, res) => {
//   try {
//     console.log('Request Body:', req.body);  // To check form data
//     console.log('Request Files:', req.files);  // To check file data

//     const { name, rollNo, branch, vehicle } = req.body;
//     const images = req.files ? req.files.map(file => file.path) : [];

//     const newUser = new User({
//       name,
//       rollNo,
//       branch,
//       images,
//       vehicle,
//     });

//     await newUser.save();

//     // Delete uploaded files after saving to DB
//     req.files.forEach(file => {
//       fs.unlink(file.path, (err) => {
//         if (err) {
//           console.error(`Error deleting file ${file.path}:`, err);
//         }
//       });
//     });

//     res.status(200).json({ message: "User registered successfully", user: newUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

import fs from 'fs';
import User from '../models/User.js'; // model path adjust kar lena

export const registerUser = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const { name, rollNo, branch } = req.body;

    // ✅ Safely parse vehicle details if sent as stringified JSON
    let vehicle = {};
    try {
      vehicle = typeof req.body.vehicle === "string"
        ? JSON.parse(req.body.vehicle)
        : req.body.vehicle;
    } catch (e) {
      return res.status(400).json({ message: "❌ Invalid vehicle data format" });
    }

    const images = req.files ? req.files.map(file => {
      const base64Image = file.buffer.toString("base64");
      return {
        name: file.originalname,
        data: base64Image,
        contentType: file.mimetype,
      };
    }) : [];

    const newUser = new User({
      name,
      rollNo,
      branch,
      images,
      vehicle,
    });

    await newUser.save();

    res.status(200).json({
      message: "✅ User registered successfully",
      user: newUser,
    });

  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users)
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
