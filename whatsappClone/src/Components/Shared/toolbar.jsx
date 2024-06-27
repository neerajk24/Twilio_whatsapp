import React from 'react';
import { Toolbar, Typography, Button } from "@mui/material";

const MemoizedToolbar = React.memo(({ handleServiceChange, activeService }) => (
    <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>Twilio Chat</Typography>
        <Button
            color="inherit"
            onClick={() => handleServiceChange('whatsapp')}
            style={{
                backgroundColor: activeService === 'whatsapp' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                marginRight: '8px'
            }}
        >
            WhatsApp
        </Button>
        <Button
            color="inherit"
            onClick={() => handleServiceChange('sms')}
            style={{
                backgroundColor: activeService === 'sms' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
        >
            SMS
        </Button>
    </Toolbar>
));

export default MemoizedToolbar;