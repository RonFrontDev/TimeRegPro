
import React, { useState } from 'react';

interface CollapsibleSubSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSubSection: React.FC<CollapsibleSubSectionProps> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-base-300 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 bg-base-100 hover:bg-base-300/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-expanded={isOpen}
            >
                <h4 className="font-semibold text-content-100 text-left">{title}</h4>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transform transition-transform duration-300 text-content-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-base-300">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSubSection;
