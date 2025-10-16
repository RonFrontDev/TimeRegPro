
import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="bg-base-200 rounded-xl shadow-lg overflow-hidden">
            <button
                onClick={toggleOpen}
                className="w-full flex justify-between items-center p-6 text-left font-bold text-content-100 bg-base-200 hover:bg-base-300/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-bold">{title}</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-6 border-t border-base-300">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;
