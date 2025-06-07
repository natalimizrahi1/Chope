import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='Wrapper'>
  <h1 className='Title'>Welcome to Chope! 🐾</h1>
          <button type='button' className='Button' onClick={() => navigate('/register/parent')}>
            I'm a Parent
          </button>
          <button type='button' className='Button' onClick={() => navigate('/register/kid')}>
            I'm a Kid
          </button>
    </div>
  );
};

export default HomePage;
