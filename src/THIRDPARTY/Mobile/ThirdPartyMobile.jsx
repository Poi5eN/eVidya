import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaUserPlus } from "react-icons/fa";
import { FiUser } from 'react-icons/fi';
import { useStateContext } from "../../contexts/ContextProvider";
import UserDetails from "../UserDetails";

import AllStudent from "../AllStudent";
import AdmissionForm from "../AdmissionForm";

const ThirdPartyMobile = () => {
    const { currentColor } = useStateContext();
    const [activeComponent, setActiveComponent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false); // State for Modal visibility
    const buttonVariants = {
        hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
        tap: { scale: 0.95 },
        initial: { scale: 1 },
    };

    const fixedMenuItems = [

        {
            icon: <FaHome className="text-2xl " />,
            title: "Home",
            name: "Home", // Added name property
        },
        {
            icon: <FaUserPlus className="text-2xl " />,
            title: "Admission",
            name: "Admission" // Added name property
        },
        {
            icon: <FiUser />,
            title: "About ",
            name: "About", // Added name property
        },
    ];

    const handleClick = (componentName) => {
        if (componentName === "Student") {
            setModalOpen(true); // Open the modal
        } else {
            setActiveComponent(componentName);  // For other components
        }
    };

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "Admission":
                return <AdmissionForm />;
            case "About":
                return <UserDetails />;
            case "Home":
                return   <AllStudent/>;
               
            default:
                return<AllStudent/>;
        }
    };

    return (
        <div className="flex flex-col h-[85.1vh] ">

            <div className="flex-grow overflow-y-auto">
                {renderActiveComponent()}
            </div>

            <div className="bg-gray-800 p-2 fixed bottom-0 w-full"
                style={{ background: "#f0592e" }}
                // style={{ background: currentColor }}
            >
                <div className="flex justify-around max-w-md mx-auto">
                    {fixedMenuItems.map((item, index) => (
                        <motion.button
                            key={index}
                            variants={buttonVariants}
                            whileTap="tap"
                            initial="initial"
                            className="text-white hover:text-white focus:outline-none flex justify-center items-center flex-col"
                            onClick={() => handleClick(item.name)}
                        >
                            <span className="text-3xl ml-2"> {item.icon}</span>
                            <p className="text-xl">{item.title}</p>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThirdPartyMobile;

