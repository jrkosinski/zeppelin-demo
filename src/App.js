import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sell from "./Sell";
import Buy from "./Buy";
import Collect from "./Collect";

function App() {
    return (
        <Router>
            <div className="App" style={{"paddingTop":10}}>
                <header>
                    <nav>
                        <Link to="/">home</Link> &nbsp;&#x2022; &nbsp;&nbsp;
                        <Link to="/sell">sell</Link> &nbsp; &#x2022; &nbsp;&nbsp;
                        <Link to="/buy">buy</Link> &nbsp; &#x2022; &nbsp;&nbsp;
                        <Link to="/collect">collect</Link>
                    </nav>
                </header>
            </div>
            
            <Routes>
                <Route path="/" element={<Sell/>} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/collect" element={<Collect />} />
            </Routes>
        </Router>
    );
}

export default App;
