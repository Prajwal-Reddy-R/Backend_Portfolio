const express = require('express');
const { Resend } = require('resend');
const Contact = require('../models/Contact');
require('dotenv').config();

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_USER) {
        console.error('Missing RESEND_API_KEY or EMAIL_USER environment variables.');
        return res.status(500).json({ message: 'Email service is not configured. Please try again later.' });
    }

    try {
        // Save to MongoDB
        const contact = new Contact({ name, email, message });
        await contact.save();

        // Send notification email via Resend (HTTPS API — not blocked on Render's free tier,
        // unlike raw SMTP which Render blocks on ports 25/465/587 for free web services)
        const { error } = await resend.emails.send({
            from: 'Portfolio Contact Form <onboarding@resend.dev>',
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        if (error) {
            console.error('Resend error:', error);
            // Message is already saved to MongoDB even if the email notification fails,
            // so nothing is lost — but we tell the user something went wrong.
            return res.status(500).json({ message: 'Message saved, but the notification email failed to send.' });
        }

        res.status(200).json({ message: 'Message sent and saved successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

module.exports = router;


