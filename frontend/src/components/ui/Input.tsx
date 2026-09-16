'use client';

import React, { forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, id, ...rest }, ref) => {
    return (
        <div className={styles.wrapper}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                className={[styles.input, error ? styles.hasError : ''].join(' ').trim()}
                {...rest}
            />
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
