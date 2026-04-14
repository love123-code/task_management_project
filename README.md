# TaskFlow - Task Management and Collaboration Tool

## Project Overview
- **Project Name**: TaskFlow
- **Type**: Full-stack MERN Web Application
- **Core Functionality**: A Trello-like task management tool enabling users to create boards, manage lists, and organize tasks with real-time collaboration features
- **Target Users**: Teams and individuals who need visual task management

---

## Tech Stack
- **Frontend**: React.js with Vite, React Router, React Beautiful DND
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Styling**: CSS Modules with custom design system

---

## UI/UX Specification

### Color Palette
```css
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-tertiary: #252525;
--bg-card: #2d2d2d;
--accent-primary: #6366f1;
--accent-secondary: #818cf8;
--accent-success: #22c55e;
--accent-warning: #f59e0b;
--accent-danger: #ef4444;
--text-primary: #f5f5f5;
--text-secondary: #a3a3a3;
--text-muted: #737373;
--border-color: #404040;
--hover-bg: #3a3a3a;
```

### Typography
- **Primary Font**: 'Inter', sans-serif (from Google Fonts)
- **Headings**: 
  - H1: 2rem, weight 700
  - H2: 1.5rem, weight 600
  - H3: 1.25rem, weight 600
- **Body**: 0.95rem, weight 400
- **Small**: 0.85rem, weight 400

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

### Layout Structure

#### Authentication Pages (Login/Signup)
- Centered card layout (max-width: 420px)
- Dark themed with subtle gradient background
- Form inputs with floating labels
- Animated transitions between login/signup

#### Dashboard Page
- Top navigation bar (height: 60px)
- Board grid layout with responsive columns
- Board cards with hover effects
- "Create Board" modal/dropdown

#### Board Page
- Fixed sidebar (width: 260px on desktop, collapsible on mobile)
- Horizontal scrolling lists area
- Task cards within lists with drag-and-drop

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Components

#### Buttons
- Primary: Solid accent color, white text
- Secondary: Transparent with border
- Danger: Red variant for destructive actions
- States: hover (lighten 10%), active (darken 5%), disabled (opacity 0.5)

#### Input Fields
- Dark background (#252525)
- Border on focus (accent color)
- Error state with red border
- Placeholder text in muted color

#### Cards
- Board Card: 240px width, 140px height, rounded-lg (12px)
- Task Card: Full width, min-height 80px, rounded-md (8px)

#### Modals
- Backdrop blur effect
- Centered with max-width 500px
- Slide-down animation on open

### Animations
- Page transitions: fade (200ms ease)
- Card hover: scale(1.02) + shadow increase
- Button hover: background-color transition (150ms)
- Drag-and-drop: smooth with 200ms transition
- Modal: fade + slide (250ms ease-out)

---

## Functionality Specification

### Authentication System
1. **Signup**
   - Fields: name, email, password, confirm password
   - Password requirements: min 6 characters
   - Validation: email format, matching passwords
   - JWT generation on successful signup

2. **Login**
   - Fields: email, password
   - JWT token stored in localStorage
   - Auto-redirect to dashboard on success

3. **Logout**
   - Clear JWT from localStorage
   - Redirect to login page

### Board Management
1. **Create Board**
   - Name field (default: "Task Board")
   - Type selection: Solo or Collaborative
   - Solo: Creator-only access
   - Collaborative: Generates share credentials (board ID + password)

2. **Join Collaborative Board**
   - Input board ID and password
   - Validates credentials
   - Adds user to board collaborators

3. **Delete Board**
   - Confirmation modal
   - Creator can delete any board
   - Removes all associated lists and tasks

4. **Board Access**
   - Solo: Only creator can access
   - Collaborative: Creator + collaborators with valid credentials

### List Management
1. **Create List**
   - Name field (e.g., "To Do", "Doing", "Done")
   - Position determines order (drag to reorder)

2. **Delete List**
   - Confirmation required
   - Deletes all tasks within

3. **Reorder Lists**
   - Drag-and-drop between lists

### Task Management
1. **Create Task**
   - Title field (required)
   - Description field (optional)
   - Added to selected list

2. **Delete Task**
   - Delete button on task card
   - No confirmation (can undo mentally)

3. **Move Task**
   - Drag-and-drop between lists
   - Reorder within same list

4. **Task Display**
   - Show title
   - Show truncated description
   - Show created date

### Real-time Features (Socket.io)
1. **Board Updates**
   - When a user creates/modifies/deletes list or task, all connected users see updates
   - Collaborative boards broadcast changes instantly

2. **User Presence**
   - Show connected users in collaborative boards

---

## Data Models

### User Model
```javascript
{
  name: String (required, min 2),
  email: String (required, unique, valid email),
  password: String (required, min 6, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Board Model
```javascript
{
  name: String (default: "Task Board"),
  type: String (enum: "solo", "collaborative"),
  creator: ObjectId (ref: User),
  collaborators: [ObjectId] (ref: User),
  sharePassword: String (for collaborative boards),
  lists: [{
    name: String,
    position: Number,
    tasks: [{
      title: String,
      description: String,
      position: Number,
      createdAt: Date
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Auth Routes (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Board Routes (`/api/boards`)
- `GET /api/boards` - Get all user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board by ID
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/join` - Join collaborative board

### List Routes (`/api/boards/:boardId/lists`)
- `POST /api/boards/:boardId/lists` - Create list
- `PUT /api/boards/:boardId/lists/:listId` - Update list
- `DELETE /api/boards/:boardId/lists/:listId` - Delete list

### Task Routes (`/api/boards/:boardId/lists/:listId/tasks`)
- `POST /api/boards/:boardId/lists/:listId/tasks` - Create task
- `PUT /api/boards/:boardId/lists/:listId/tasks/:taskId` - Update task
- `DELETE /api/boards/:boardId/lists/:listId/tasks/:taskId` - Delete task

---

## Folder Structure

```
/Mini_Project
├── /backend
│   ├── /config
│   │   └── db.js
│   ├── /controllers
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   └── listController.js
│   ├── /middleware
│   │   └── auth.js
│   ├── /models
│   │   ├── User.js
│   │   └── Board.js
│   ├── /routes
│   │   ├── authRoutes.js
│   │   └── boardRoutes.js
│   ├── /socket
│   │   └── index.js
│   ├── server.js
│   └── package.json
│
├── /frontend
│   ├── /public
│   ├── /src
│   │   ├── /components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── BoardCard.jsx
│   │   │   ├── BoardList.jsx
│   │   │   ├── CreateBoardModal.jsx
│   │   │   ├── JoinBoardModal.jsx
│   │   │   ├── List.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── /context
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── /hooks
│   │   │   └── useAuth.js
│   │   ├── /pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Board.jsx
│   │   ├── /styles
│   │   │   ├── global.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   └── Board.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── SPEC.md
```

---

## Acceptance Criteria

### Authentication
- [ ] User can signup with name, email, password
- [ ] User can login with email and password
- [ ] User can logout and token is cleared
- [ ] Protected routes redirect to login if not authenticated

### Boards
- [ ] User can create solo boards
- [ ] User can create collaborative boards with auto-generated credentials
- [ ] User can view all their boards on dashboard
- [ ] User can delete a board
- [ ] User can join collaborative board using credentials
- [ ] Only authorized users can access boards

### Lists
- [ ] User can create lists within a board
- [ ] User can delete lists
- [ ] Lists display in horizontal order
- [ ] Drag-and-drop to reorder lists works

### Tasks
- [ ] User can create tasks in any list
- [ ] User can delete tasks
- [ ] Drag-and-drop to move tasks between lists works
- [ ] Tasks display with title and description

### Real-time
- [ ] Changes in collaborative boards reflect to all users instantly
- [ ] Socket connection establishes on board page

### UI/UX
- [ ] Dark theme applied consistently
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Smooth animations and transitions
- [ ] Loading states shown appropriately
- [ ] Error messages displayed clearly
.
