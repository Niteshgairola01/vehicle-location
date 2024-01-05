import { toast } from 'react-hot-toast'

export const SuccessToast = (message) => {
    toast.success(message, {
        style: {
            border: '1px solid #29d500',
            padding: '0.5rem',
            color: '#fff',
            background: '#29d500',
            fontWeight: "550",
            fontSize: '0.8rem'
        },
        iconTheme: {
            primary: '#29d500',
            secondary: '#FFFAEE',
        },
    });
};

export const ErrorToast = (message) => {
    toast.error(message, {
        style: {
            border: '1px solid #d50000',
            padding: '0.5rem',
            color: '#fff',
            background: '#d50000',
            fontWeight: "550",
            fontSize: '0.8rem'
        },
        iconTheme: {
            primary: '#d50000',
            secondary: '#FFFAEE',
        },
    });
};

export const ProcessToast = (message) => {
    toast.error(message, {
        style: {
            border: '1px solid #c8c9ca',
            padding: '0.5rem',
            color: '#fff',
            background: '#c8c9ca',
            fontWeight: "550",
            fontSize: '0.8rem'
        },
        iconTheme: {
            primary: '#c8c9ca',
            secondary: '#FFFAEE',
        },
    })
};

export const WarningToast = (message) => {
    toast.error(message, {
        style: {
            textAlign: 'center',
            border: '1px solid #f1c40f',
            padding: '0.5rem',
            color: '#fff',
            background: '#f1c40f',
            fontWeight: "550",
            fontSize: '0.8rem'
        },
        iconTheme: {
            primary: '#f1c40f',
            secondary: '#FFFAEE',
        },
    })
};
