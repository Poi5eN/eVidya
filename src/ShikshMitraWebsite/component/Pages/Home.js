import React from "react";
import Hero from "../New/Hero";
import Card from "../New/Card";
import Related from "../New/Related";
import Dashboard from "../New/Dashboard";
// import Community from "../Community/Community";
// import Testimonial from "../Testimonial/Testimonial";
// import ContactForm from "../ContactForm/ContactForm";
// import Card from "../Card/Card";
// import Ourwork from "../Gsap/Ourworks/Ourwork";


const Home = () => {
  return (
    <div className="bg-[#1f2937]">
       <Hero/>
       <Card/>
       <Related/>
       <Dashboard/>
      {/* <Card />
      <Ourwork />
      
      <Community />
      <Testimonial />
     
      <ContactForm /> */}
    </div>
  );
};

export default Home;
