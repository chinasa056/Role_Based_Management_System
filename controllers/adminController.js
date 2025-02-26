const adminModel = require("../models/admin")
const bcrypt = require("bcrypt")

exports.registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password, gender } = req.body

        const user = await adminModel.findOne({ email: email.toLowerCase() })
        if (user) {
            return res.status(400).json({
                message: `user with email: ${email} already exists`
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // create an instance of the new user 
        const newAdmin = new adminModel({
            fullName,
            email,
            password: hashedPassword,
            gender

        })
    } catch (error) {
        console.log(error);

    }
}

