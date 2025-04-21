const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Store users in a JSON file (in a real app, this would be a database)
const dataPath = path.join(__dirname, '../../data');
const usersFilePath = path.join(dataPath, 'users.json');

class UserModel {
  constructor() {
    this.users = this.loadUsers();
  }

  // Load users from JSON file
  loadUsers() {
    try {
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify([]));
        return [];
      }

      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users to JSON file
  saveUsers() {
    try {
      fs.writeFileSync(usersFilePath, JSON.stringify(this.users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  // Create a new user
  async createUser(userData) {
    try {
      // Check if user exists
      const existingUser = this.users.find(user => user.email === userData.email);
      if (existingUser) {
        return { success: false, message: 'Email already in use' };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user object
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        settings: {
          notifications: {
            email: true,
            push: true,
            reminders: true
          },
          privacy: {
            dataSharing: false,
            anonymousAnalytics: true
          }
        }
      };

      // Add to users array
      this.users.push(newUser);
      this.saveUsers();

      // Create return object (without password)
      const { password, ...userWithoutPassword } = newUser;
      return { 
        success: true, 
        message: 'User created successfully', 
        user: userWithoutPassword 
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Error creating user' };
    }
  }

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      // Find user
      const user = this.users.find(user => user.email === email);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Create token
      const tokenPayload = { userId: user.id };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '7d'
      });

      // Create return object (without password)
      const { password: _, ...userWithoutPassword } = user;
      return { 
        success: true, 
        message: 'Login successful', 
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, message: 'Error logging in' };
    }
  }

  // Get user by ID
  getUserById(userId) {
    const user = this.users.find(user => user.id === userId);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user data
  updateUser(userId, userData) {
    try {
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Update user data
      const updatedUser = {
        ...this.users[userIndex],
        ...userData,
        updatedAt: new Date().toISOString()
      };

      // Don't overwrite password unless explicitly changing it
      if (!userData.password) {
        updatedUser.password = this.users[userIndex].password;
      }

      this.users[userIndex] = updatedUser;
      this.saveUsers();

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return { 
        success: true, 
        message: 'User updated successfully', 
        user: userWithoutPassword 
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: 'Error updating user' };
    }
  }

  // Change user password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, this.users[userIndex].password);
      if (!isMatch) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      this.users[userIndex].password = hashedPassword;
      this.users[userIndex].updatedAt = new Date().toISOString();
      this.saveUsers();

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Error changing password' };
    }
  }

  // Delete user account
  deleteUser(userId) {
    try {
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Remove user from array
      this.users.splice(userIndex, 1);
      this.saveUsers();

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: 'Error deleting account' };
    }
  }

  // Update user settings
  updateUserSettings(userId, settings) {
    try {
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Update settings
      this.users[userIndex].settings = {
        ...this.users[userIndex].settings,
        ...settings
      };
      this.users[userIndex].updatedAt = new Date().toISOString();
      this.saveUsers();

      return { 
        success: true, 
        message: 'Settings updated successfully',
        settings: this.users[userIndex].settings
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: 'Error updating settings' };
    }
  }
}

module.exports = new UserModel(); 