
import React, { useState } from "react";
import "./Welcome.css";

const Welcome: React.FC = () => {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className='Wrapper'>
        <>
          <h1 className='Title'>Welcome to Chope! 🐾</h1>
          <button type='button' className='Button' onClick={() => setShowSignUp(true)}>
            I'm a Parent
          </button>
          <button type='button' className='Button'>
            I'm a Kid
          </button>
        </>
     
    </div>
  );
};

export default Welcome;