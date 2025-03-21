import React, { ChangeEvent, forwardRef } from 'react';
import './style.css';

interface Props {
    label: string;
    type: 'text' | 'password' | 'hidden';
    placeholder: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error: boolean;

    icon?: 'eye-light-off-icon' | 'eye-light-on-icon' | 'expand-right-light-icon';
    onButtonClick?: () => void;

    message?: string;

    readOnly?: boolean;

    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputBox = forwardRef<HTMLInputElement, Props > ((props: Props, ref) => {
    
    const { label, type, placeholder, value, error, icon, message, readOnly } = props;
    const { onChange, onButtonClick, onKeyDown } = props;

    const onKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!onKeyDown) return;
        onKeyDown(event);
    };

    return (
        <div className='inputbox'>
            <div className='inputbox-label'>{label}</div>
            <div className={error ? 'inputbox-container-error' : 'inputbox-container'}>
                <input ref={ref} type={type} className='input' placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDownHandler} readOnly={readOnly} />
                {onButtonClick !== undefined &&
                    <div className='icon-button' onClick={onButtonClick}>
                        {icon !== undefined && <div className={`icon ${icon}`}></div>}
                    </div>
                }
            </div>
            {message !== undefined && <div className='inputbox-message'>{message}</div>}
        </div>
    )
});

export default InputBox;