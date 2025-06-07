import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="Wrapper">
      <h1 className="Title">Welcome to Chope! 🐾</h1>
      <div className="ButtonContainer">
        <button 
          type="button" 
          className="Button" 
          onClick={() => navigate('/login/parent')}
        >
          I'm a Parent
        </button>
        <button 
          type="button" 
          className="Button"
          onClick={() => navigate('/login/kid')}
        >
          I'm a Kid
        </button>
      </div>
    </div>
  );
};

export default HomePage;
