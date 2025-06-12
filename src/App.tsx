import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "@/screens/Home";
import Dashboard from "@/screens/Dashboard";

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App