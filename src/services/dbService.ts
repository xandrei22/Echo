import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Task {
  id?: string;
  title: string;
  energy: 'low' | 'med' | 'high';
  status: 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: any;
  ownerId: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ActivityLog {
  id?: string;
  energy: number;
  focus: number;
  timestamp: any;
  ownerId: string;
}

const getTaskCollection = (userId: string) => collection(db, 'users', userId, 'tasks');
const getLogCollection = (userId: string) => collection(db, 'users', userId, 'activityLogs');

export const dbService = {
  // --- User Profile ---
  async ensureUserDoc(userId: string, email: string, displayName: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email,
        displayName,
        role: 'User',
        createdAt: serverTimestamp()
      });
    }
  },

  // --- Tasks ---
  subscribeTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(getTaskCollection(userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    }, (error) => {
      console.error("Firestore Task Subscription Error:", error);
    });
  },

  async createTask(userId: string, title: string, energy: 'low' | 'med' | 'high', priority: 'low' | 'medium' | 'high' = 'medium', category: string = 'General', dueDate?: string) {
    return await addDoc(getTaskCollection(userId), {
      title,
      energy,
      priority,
      category,
      dueDate: dueDate || null,
      status: 'pending',
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteTask(userId: string, taskId: string) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  async toggleTaskStatus(userId: string, taskId: string, currentStatus: string) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const becomingCompleted = currentStatus !== 'completed';
    
    await updateDoc(taskRef, {
      status: becomingCompleted ? 'completed' : 'pending',
      updatedAt: serverTimestamp()
    });

    // RELATION: When a task is completed, we log a "Performance Pulse" 
    // to the biometric history to influence the Energy Curve learning.
    if (becomingCompleted) {
      await this.createLog(userId, 85, 95); // High energy/focus burst
    }
  },

  // --- Activity Logs ---
  subscribeLogs(userId: string, callback: (logs: ActivityLog[]) => void) {
    const q = query(getLogCollection(userId), orderBy('timestamp', 'desc'), where('ownerId', '==', userId));
    // Limit is enforced in client query but rules check resource.data.ownerId
    return onSnapshot(q, (snapshot) => {
       const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
       callback(logs);
    });
  },

  async createLog(userId: string, energy: number, focus: number) {
    return await addDoc(getLogCollection(userId), {
      energy,
      focus,
      timestamp: serverTimestamp(),
      ownerId: userId
    });
  }
};
