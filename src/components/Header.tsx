import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, Link } from 'react-router-dom';
import type { NavLink } from '../types';

const navLinks: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Activities', href: '/activities' },
    { label: 'Blog', href: '/blogs' },
    { label: 'Volunteer', href: '/volunteer' },
    {
        label: 'Resources',
        href: '#', 
        subLinks: [
            { label: 'View Resources', href: '/resources/view' },
            { label: 'Download Resources', href: '/resources/download' },
        ],
    },
    { label: 'Contact', href: '/about#contact' },
];

const NavItem: React.FC<{ link: NavLink; onClick: () => void, textColor: string }> = ({ link, onClick, textColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubLinks = link.subLinks && link.subLinks.length > 0;

    const navLinkClass = ({isActive}: {isActive: boolean}) => 
        `font-medium text-base relative py-2.5 transition-all duration-400 ease-in-out-cubic after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-400 after:ease-in-out-cubic after:rounded-sm ${textColor} ${isActive ? 'after:w-full after:bg-[#880088]' : 'hover:after:w-full hover:after:bg-[#880088]'}`;
    
    if (hasSubLinks) {
        return (
            <li className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
                <button className={`${navLinkClass({isActive: false})} flex items-center gap-1`}>
                    {link.label} <i className={`fas fa-caret-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`lg:absolute top-full left-0 bg-white shadow-lg rounded-lg min-w-[200px] overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                    {link.subLinks!.map(subLink => (
                        <RouterNavLink key={subLink.label} to={subLink.href} onClick={onClick} className="block px-4 py-3 text-sm text-[#4b0082] hover:bg-[#880088] hover:text-white hover:pl-5 transition-all duration-300 ease-in-out">
                            <i className="fas fa-eye mr-2"></i> {subLink.label}
                        </RouterNavLink>
                    ))}
                </div>
            </li>
        );
    }

    return (
        <li>
            <RouterNavLink to={link.href} onClick={onClick} className={navLinkClass}>
                {link.label}
            </RouterNavLink>
        </li>
    );
};

const Header: React.FC<{ variant?: 'light' | 'dark'}> = ({ variant = 'light'}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const headerBaseStyle = "fixed top-0 w-full z-50 transition-all duration-400 ease-in-out-cubic";
    let headerStyle = `${headerBaseStyle} ${isScrolled ? 'py-2 shadow-lg bg-white/95 backdrop-blur-md' : 'py-4 bg-white/95'}`;
    let textColor = "text-[#880088] hover:text-[#4b0082]";
    let logoTextColor = "text-[#4b0082]";
    let taglineColor = "text-[#880088]";
    let mobileBtnColor = "text-[#880088]";
    
    if (variant === 'dark') {
      headerStyle = `${headerBaseStyle} ${isScrolled ? 'py-2 shadow-lg bg-[#1a0a2e]/90 backdrop-blur-md' : 'py-4 bg-transparent'}`;
      textColor = "text-white hover:text-gray-300";
      logoTextColor = "text-white";
      taglineColor = "text-[#e6e6fa]";
      mobileBtnColor = "text-white";
    }


    return (
        <header className={headerStyle}>
            <div className="container mx-auto px-5 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="h-22 flex items-center">
                        <img src="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812502/legasi_logo_1_s14jo2.jpg" alt="LEGASI Logo" className="h-16 w-auto object-contain" />
                    </div>
                     <div className="hidden sm:flex flex-col">
                         <h1 className={`text-xl font-bold tracking-wide ${logoTextColor}`}></h1>
                        <span className={`text-xs uppercase tracking-[2px] ${taglineColor}`}></span>
                    </div>
                </Link>

                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-8">
                        {navLinks.map((link, idx) => {
                            // Add extra gap after Contact
                            if (link.label === 'Contact') {
                                return <li key={link.label} className="mr-8"><NavItem link={link} onClick={() => setIsMenuOpen(false)} textColor={textColor}/></li>;
                            }
                            return <NavItem key={link.label} link={link} onClick={() => setIsMenuOpen(false)} textColor={textColor}/>;
                        })}
                    </ul>
                </nav>

                <div className="hidden lg:flex items-center gap-6">
                    <Link to="/login" className="bg-[linear-gradient(135deg,_#880088_0%,_#880088_100%)] text-white font-semibold px-7 py-3 rounded-full text-sm shadow-[0_5px_20px_rgba(106,13,173,0.4)] transition-all duration-400 ease-in-out-cubic hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(40,32,45,0.6)] relative overflow-hidden z-[1] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[linear-gradient(135deg,_#4b0082_0%,_#880088_100%)] before:transition-all before:duration-400 before:ease-in-out-cubic before:z-[-1] hover:before:left-0">
                        Login
                    </Link>
                </div>

                <button className={`lg:hidden text-2xl ${mobileBtnColor}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>
            
            <div className={`lg:hidden fixed top-[76px] right-0 bg-white w-[280px] h-[calc(100vh-76px)] flex flex-col p-8 shadow-[-5px_0_15px_rgba(0,0,0,0.1)] transition-transform duration-400 ease-in-out-cubic ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <ul className="flex flex-col gap-4">
                    {navLinks.map((link, idx) => {
                        // Add extra margin after Contact for mobile
                        if (link.label === 'Contact') {
                            return <li key={link.label} className="mb-4"><NavItem link={link} onClick={() => setIsMenuOpen(false)} textColor="text-[#880088] hover:text-[#4b0082]" /></li>;
                        }
                        return <NavItem key={link.label} link={link} onClick={() => setIsMenuOpen(false)} textColor="text-[#880088] hover:text-[#4b0082]" />;
                    })}
                 </ul>
                 <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-8 text-center bg-[linear-gradient(135deg,_#880088_0%,_#880088_100%)] text-white font-semibold px-7 py-3 rounded-full text-sm shadow-[0_5px_20px_rgba(106,13,173,0.4)] transition-all duration-400 ease-in-out-cubic hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(40,32,45,0.6)]">
                    Login
                </Link>
            </div>

        </header>
    );
};

export default Header;
