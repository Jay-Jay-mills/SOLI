# SOLI



## 🔧 Backend Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   The `.env` file is already configured with:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8080

   # Database
   MONGO_URI=mongodb+srv://SOLI:SOLI-1234@solidb.oi8gcxw.mongodb.net/SOLIDB?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=1h
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-this-in-production
   JWT_REFRESH_EXPIRE=7d

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads

   # CORS
   CLIENT_URL=http://localhost:3000
   ```

   ⚠️ **Security Note**: Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production!

4. **Create Admin User**
   ```bash
   npm run seed
   ```

   This will create an admin user with:
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Role**: Admin

## 🏃‍♂️ Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8080`




## 🛠️ Frontend Installation

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd client
```

2. Install dependencies:
```powershell
npm install
```

3. Set up environment variables:
```powershell
cp .env.dev .env.local
```

4. Run the development server:
```powershell
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

