"use client";
import React from 'react';
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    children: React.ReactElement;
    width?: "fit-content" | "100%";
    className?: string;
    direction?: "bottom" | "left" | "right";
    delay?: number;
}

export const Reveal = ({ 
    children, 
    width = 'fit-content', 
    className, 
    direction = "bottom",
    delay = 0.4 
}: Props) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {once: true});

    const mainControls = useAnimation();

    const getVariants = () => {
        switch (direction) {
            case "left":
                return {
                    hidden: { opacity: 0, x: -75 },
                    visible: { opacity: 1, x: 0 }
                };
            case "right":
                return {
                    hidden: { opacity: 0, x: 75 },
                    visible: { opacity: 1, x: 0 }
                };
            default: // bottom
                return {
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 }
                };
        }
    };

    useEffect(() =>{
        if(isInView){
            mainControls.start('visible');
        }
    }, [isInView]);

    return(
        <div 
            ref={ref} 
            className={className}
            style={{ position: 'relative', width, overflow: 'visible' }}
        >
            <motion.div
                variants={getVariants()}
                initial='hidden'
                animate={mainControls}
                transition={{ duration: 0.5, delay: delay}}
            >
                {children}
            </motion.div>
        </div>
    )
}