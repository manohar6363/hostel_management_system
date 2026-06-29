import React, { useState } from 'react';
import {
    FaTh,
    FaBars
} from "react-icons/fa";
import {
    MdOutlineAddHome,
    MdPlaylistAddCheckCircle,
    MdPayment
} from "react-icons/md";
import {
    BsFillPersonPlusFill,
    BsClipboardCheckFill
} from "react-icons/bs";
import {
    FcViewDetails
} from "react-icons/fc";
import {
    FiLogOut,
    FiSettings
} from "react-icons/fi";
import { NavLink, useLocation } from 'react-router-dom';

const AdminSidebar = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    const navState = location.state || {};

    const toggle = () => {
        setIsExpanded(!isExpanded);
    };

    const menuItem = [
        {
            path: "/add_staff",
            name: "Dashboard",
            icon: <FaTh />,
            state: navState
        },
        {
            path: "/AddStudents",
            name: "Add Students",
            icon: <BsFillPersonPlusFill />,
            state: navState
        },
        {
            path: "/AddRooms",
            name: "Add Rooms",
            icon: <MdOutlineAddHome />,
            state: navState
        },
        {
            path: "/RoomAllocation",
            name: "Room Allocation",
            icon: <MdPlaylistAddCheckCircle />,
            state: navState
        },
        {
            path: "/Student_Details",
            name: "Student Details",
            icon: <FcViewDetails />,
            state: navState
        },
        {
            path: "/Attendance",
            name: "Attendance",
            icon: <BsClipboardCheckFill />,
            state: navState
        },
        {
            path: "/Fees",
            name: "Fees",
            icon: <MdPayment />,
            state: navState
        },
        {
            path: "/admin_settings",
            name: "Admin Settings",
            icon: <FiSettings />,
            state: navState
        },
        {
            path: "/",
            name: "LOG OUT",
            icon: <FiLogOut />
        }
    ];

    return (
        <div className={`scontainer ${isExpanded ? "sidebar-expanded" : ""}`}>
            <div style={{ width: isExpanded ? "200px" : "70px" }} className="sidebar">
                <div className="top_section">
                    <h1 style={{ display: isExpanded ? "block" : "none" }} className="logo">HMS</h1>
                    <div style={{ marginLeft: isExpanded ? "50px" : "0px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {
                    menuItem.map((item, index) => (
                        <NavLink
                            to={item.path}
                            key={index}
                            className="link"
                            activeClassName="active"
                            state={item.state || undefined}
                        >
                            <div className="icon">{item.icon}</div>
                            <div style={{ display: isExpanded ? "block" : "none" }} className="link_text">
                                {item.name}
                            </div>
                        </NavLink>
                    ))
                }
            </div>
            <main className="main-content">{children}</main>
        </div>
    );
};

export default AdminSidebar;
