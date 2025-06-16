import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Home from "./components/Home";
import AccrualsPage from "./components/AccrualsPage";
import PaymentPage from "./components/PaymentPage";
import TasksPage from "./components/TasksPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/accruals" element={<AccrualsPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/tasks" element={<TasksPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
