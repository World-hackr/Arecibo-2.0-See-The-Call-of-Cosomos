import React from "react";
import image2 from "../assets/image2.png";
import Threads from "./Threads";

const Dashboard = () => {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center">
      {/* Heading + Logo */}
      <div className="flex flex-col md:flex-row items-center justify-center mt-32 md:mt-56 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome To</h1>
        <span className="mt-6 md:mt-0 md:ml-6">
          <img src={image2} alt="Logo" className="w-64 md:w-[400px]" />
        </span>
      </div>

      {/* Threads Component */}
      <div className="mt-12 w-full flex justify-center">
        <Threads />
      </div>

      {/* Button (centered) */}
      <div className="mt-12 flex justify-center w-full">
        <button className="bg-white w-40 h-14 flex items-center justify-center rounded-2xl cursor-pointer text-xl md:text-2xl text-black font-bold hover:scale-105 transition" onClick={() => window.location.href="/Gallery"}>
          Get Start
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
