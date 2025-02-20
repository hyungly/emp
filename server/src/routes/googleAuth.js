import express from 'express';
import passport from 'passport';
import { oauthCallback } from '../controllers/authController.js';


const router = express.Router();

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
  }),
);

router.get('/auth/google/callback', passport.authenticate('google', { session: true }), oauthCallback);

export default router;
