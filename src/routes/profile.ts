// routes/profile.ts
import express, { Response } from 'express';
import auth from '../middlewares/auth';
import User from '../Models/User'; // Make sure you have this model

const router = express.Router();

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;