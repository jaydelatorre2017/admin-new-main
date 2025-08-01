import React from 'react';
import { Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

const IDCard = React.forwardRef(({ participant }, ref) => {
  const defaultParticipant = {
    id: 'RAEL-2025-0000',
    name: 'MARIA CRISTINA',
    position: 'SCHOOL HEAD',
    full_name: 'Maria Cristina Dela Cruz',
    division_name: 'CAMARINES NORTE',
    school: 'DAET ELEMENTARY SCHOOL',
    office: '',
    phone_number: '09171234567',
    participant_image_url: '/default.png',
  };

  const data = participant || defaultParticipant;

  return (
    <Box
      ref={ref}
      sx={{
        width: 420,
        height: 620,
        overflow: 'hidden',
        backgroundColor: '#0b2545',
        backgroundImage: 'url("/1.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        borderRadius: 3,
        boxShadow: 6,
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        position: 'relative',
        '@media print': {
          boxShadow: 'none',
          backgroundImage: 'url("/1.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          pt: 1,
          pb: 2.5,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Left Logo */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          left: 16,
          width: 70,
          height: 70,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src="LeftLogo.png" alt="Left Logo" style={{ width: '90%', height: '90%' }} />
        </Box>

        {/* Right Logo */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 16,
          width: 70,
          height: 70,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src="RightLogo.png" alt="Right Logo" style={{ width: '90%', height: '90%' }} />
        </Box>

        {/* Title */}
        <Box sx={{ mt: 6 }}>
          <Typography fontSize={24} fontWeight={700}>RAEL</Typography>
          <Typography fontSize={14} color="#d0d0d0">
            Regional Assembly of Educational Leaders
          </Typography>
          <Typography fontSize={14} color="#d0d0d0">
            {data.formatted_event_date || 'Event Date'}
          </Typography>
        </Box>
      </Box>

      {/* Profile Picture */}
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '5px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          bgcolor: '#ffffff',
        }}>
          <img
            crossOrigin="anonymous"
            src={data.participant_image_url}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </Box>

      {/* Name and Role */}
      <Box sx={{ textAlign: 'center', mt: 2, px: 2 }}>
        <Typography fontSize={15} color="#d0d0d0">{data.position}</Typography>
        <Typography fontSize={28} fontWeight={600}>
          {data.name.toUpperCase()}
        </Typography>
      </Box>

      {/* Bottom Section */}
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography fontSize={11} fontWeight={500}>
            Full Name: {data.full_name.toUpperCase()}
          </Typography>
          <Typography fontSize={11}>Division: {data.division_name}</Typography>
          {data.school
            ? <Typography fontSize={11}>School: {data.school}</Typography>
            : <Typography fontSize={11}>Office: {data.office}</Typography>}
          <Typography fontSize={11}>Phone: {data.phone_number}</Typography>
        </Box>
        <Box sx={{
          width: 90,
          height: 90,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <QRCodeSVG
            value={String(data.id)}
            size={80}
            level="H"
            bgColor="transparent"
            fgColor="#0b2545"
          />
        </Box>
      </Box>
    </Box>
  );
});

export default IDCard;
