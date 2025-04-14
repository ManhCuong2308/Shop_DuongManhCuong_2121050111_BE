import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Counter schema for generating sequential IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Function to generate the next sequential number
async function getNextSequence(counterId) {
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    // required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  }
}, {
  timestamps: true
});

// Generate userId before saving
userSchema.pre('save', async function(next) {
  try {
    // Only generate userId if it's a new user
    if (this.isNew) {
      const seq = await getNextSequence('userId');
      // Pad the number with zeros to make it 4 digits
      const paddedSeq = String(seq).padStart(4, '0');
      // Set userId based on whether the user is an admin
      this.userId = this.isAdmin ? `AD-${paddedSeq}` : `User-${paddedSeq}`;
    }

    // Only hash password if it has been modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User; 