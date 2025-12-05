
import React from 'react';

const RainEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <style>{`
        .rain {
          position: absolute;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .rain.back-row {
          display: none;
          z-index: 0; 
          bottom: 60px;
          opacity: 0.5;
        }

        .drop {
          position: absolute;
          bottom: 100%;
          width: 15px;
          height: 120px;
          pointer-events: none;
          animation: drop 0.5s linear infinite;
        }

        @keyframes drop {
          0% { transform: translateY(0vh); }
          75% { transform: translateY(90vh); }
          100% { transform: translateY(90vh); }
        }

        .stem {
          width: 1px;
          height: 60%;
          margin-left: 7px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25));
          animation: stem 0.5s linear infinite;
        }

        @keyframes stem {
          0% { opacity: 1; }
          65% { opacity: 1; }
          75% { opacity: 0; }
          100% { opacity: 0; }
        }

        /* Generate random positions */
        .drop:nth-child(1) { left: 5%; animation-duration: 0.9s; animation-delay: 0.1s; }
        .drop:nth-child(2) { left: 10%; animation-duration: 1.1s; animation-delay: 1s; }
        .drop:nth-child(3) { left: 15%; animation-duration: 1.3s; animation-delay: 0.5s; }
        .drop:nth-child(4) { left: 20%; animation-duration: 1.1s; animation-delay: 0.1s; }
        .drop:nth-child(5) { left: 25%; animation-duration: 0.9s; animation-delay: 2s; }
        .drop:nth-child(6) { left: 30%; animation-duration: 1.2s; animation-delay: 1.5s; }
        .drop:nth-child(7) { left: 35%; animation-duration: 1.5s; animation-delay: 0.2s; }
        .drop:nth-child(8) { left: 40%; animation-duration: 1.1s; animation-delay: 0.8s; }
        .drop:nth-child(9) { left: 45%; animation-duration: 1.0s; animation-delay: 1.2s; }
        .drop:nth-child(10) { left: 50%; animation-duration: 0.8s; animation-delay: 0.4s; }
        .drop:nth-child(11) { left: 55%; animation-duration: 1.3s; animation-delay: 1.8s; }
        .drop:nth-child(12) { left: 60%; animation-duration: 1.1s; animation-delay: 0.6s; }
        .drop:nth-child(13) { left: 65%; animation-duration: 1.4s; animation-delay: 0.3s; }
        .drop:nth-child(14) { left: 70%; animation-duration: 1.2s; animation-delay: 0.9s; }
        .drop:nth-child(15) { left: 75%; animation-duration: 1.0s; animation-delay: 1.4s; }
        .drop:nth-child(16) { left: 80%; animation-duration: 1.5s; animation-delay: 0.7s; }
        .drop:nth-child(17) { left: 85%; animation-duration: 0.9s; animation-delay: 0.2s; }
        .drop:nth-child(18) { left: 90%; animation-duration: 1.3s; animation-delay: 1.1s; }
        .drop:nth-child(19) { left: 95%; animation-duration: 1.1s; animation-delay: 0.5s; }
      `}</style>

      <div className="rain front-row">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="drop">
                <div className="stem"></div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default RainEffect;
