const express = require('express')
const { Router } = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const { check, validationResult } = require('express-validator/check')

// @route  GET api/auth
// @desc   Test route
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status('Error has occurred')
    }
})

// @route  POST api/auth
// @desc   Athenticate user & get token
// @access Public
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            let user = await User.findOne({ email })

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }],
                })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            // ! ADDED THIS FOR JWT

            const payload = {
                user: {
                    id: user.id,
                },
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 }, // 3600 (1 hour) for production
                (err, token) => {
                    if (err) throw err
                    res.json({ token })
                }
            )

            // ! END
        } catch (err) {
            console.log(err.message)
            res.stauts(500).send('Server Error')
        }
    }
)

module.exports = router
