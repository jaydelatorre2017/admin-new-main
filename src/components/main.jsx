// React and Router
import { useNavigate, Navigate } from 'react-router-dom';

// React & Utility
import PropTypes from 'prop-types';


// MUI Components
import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FactCheckIcon from '@mui/icons-material/FactCheck';


// Toolpad Core
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

// Utilities
import useSwalTheme from '../utils/useSwalTheme';
import { isTokenValid, decodeToken } from '../utils/tokenUtils';

// Pages
import Home from './Home';
import RegisteredPage from './Registered_Participants';
import ResidentList from './Events/EventList';
import AddResident from './Events/AddEvents';
import AttendanceLogs from './Attendance_logs';
import AdminControl from './AdminPanel';
import NotAuthorized from './NotAuthorized';
import ActivityList from './Evaluation/activity/ActivityList';
import CreateActivity from './Evaluation/activity/activity';
import EvaluationParticipant from './evaluaton_participant';




const NAVIGATION = [
  { kind: 'header', title: 'Main items', icon: <DashboardIcon /> },
  { segment: '', title: 'Dashboard', icon: <DashboardIcon /> },
  { kind: 'divider' },

  { kind: 'header', title: 'Participants', icon: <GroupIcon /> },
  {
    segment: 'participant',
    title: 'Registered Participants',
    icon: <BadgeIcon />,
  },
  {
    segment: 'id-management',
    title: 'ID Management',
    icon: <CreditCardIcon />, // Changed from BadgeIcon
  },

  { kind: 'divider', header: 'Events & Activities', icon: <EventIcon /> },
  {
    segment: 'events',
    title: 'Events Management',
    icon: <EventIcon />,
    children: [
      {
        segment: 'list',
        title: 'Events List',
        icon: <ListAltIcon />,
      },
      {
        segment: 'editor',
        title: 'Add Events',
        icon: <AddBoxIcon />,
      },
    ],
  },
  {
    segment: 'activity',
    title: 'Activity Management',
    icon: <ManageHistoryIcon />,
    children: [
      {
        segment: 'list',
        title: 'Activity List',
        icon: <ListAltIcon />,
      },
      {
        segment: 'create',
        title: 'Create Activity',
        icon: <AddBoxIcon />,
      },
    ],
  },
  {
    segment: 'evaluation',
    title: 'Evaluation Participants',
    icon: <AssignmentIndIcon />, // Changed from BadgeIcon
  },

  { kind: 'divider' },
  {
    segment: 'logs',
    title: 'Attendance Logs',
    icon: <FactCheckIcon />, // Better than ListAlt for logs
  },

  { kind: 'divider' },
  {
    segment: 'admin',
    title: 'Admin Control',
    icon: <AdminPanelSettingsIcon />,
  },
];


const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);
  const decodeTokens = token && decodeToken(token);
  const role = decodeTokens?.role;

  if (!isValid) return <Navigate to="/" />;

  if (pathname === '/admin') {
    return role === 'Super Admin' ? <AdminControl /> : <NotAuthorized />;
  }

  switch (pathname) {
    case '/': return <Home />;
    case '/participant': return <RegisteredPage />;
    case '/events/list': return <ResidentList />;
    case '/events/editor': return <AddResident />;
    case '/evaluation': return <EvaluationParticipant />;
    case '/id-management':
      window.location.href = 'http://localhost:3001/all-digital-id';
      return null;
    case '/logs': return <AttendanceLogs />;
    case '/activity/list':return <ActivityList/>
    case '/activity/create':return <CreateActivity/>
    default: return <Home />;
  }
}
DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};
// Component for toolbar actions, including status display and sign-out
function ToolbarActionsSearch() {
  // Initialize SweetAlert2 instance with custom theme
  const SwalInstance = useSwalTheme();
  // Initialize navigate function for routing
  const navigate = useNavigate();



  // Handle sign-out action
  const handleSignOut = () => {
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You will be signed out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove authentication token
        localStorage.removeItem("authToken");
        // Navigate to login page
        navigate("/", { replace: true });

        // Prevent back navigation
        setTimeout(() => {
          window.history.pushState(null, null, window.location.href);
          window.onpopstate = () => {
            window.history.pushState(null, null, window.location.href);
          };
        }, 0);
      }
    });
  };





  // Render toolbar actions
  return (
    <Stack direction="row" alignItems="center" spacing={1}>


      {/* Sign-out button with tooltip */}
      <Tooltip title="Sign Out" enterDelay={1000}>
        <div>
          <IconButton aria-label="log out" onClick={handleSignOut}>
            <PowerSettingsNewIcon />
          </IconButton>
        </div>
      </Tooltip>




      <ThemeSwitcher />
    </Stack>
  );
}

// Component for custom app title in the dashboard
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
      <Typography variant="h6">Rael Management </Typography>
    </Stack>
  );
}

// Component for sidebar footer
function SidebarFooter({ mini }) {
  return (
    <Typography variant="caption" sx={{ m: 1 }}>
      {/* Conditional text based on sidebar state */}
      {mini ? '© Mabini OJT CSS' : `©  Made with love by Mabini OJT CSS 2025`}
    </Typography>
  );
}

// PropTypes for SidebarFooter component
SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

// Main DashboardLayoutSlots component
function DashboardLayoutSlots(props) {
  // Destructure window prop for demo purposes
  const { window } = props;
  // Initialize demo router with default path
  const router = useDemoRouter('/');
  // Define demo window for testing
  const demoWindow = window !== undefined ? window() : undefined;

  // Render the dashboard layout
  return (
    <AppProvider
      navigation={NAVIGATION} // Pass navigation structure
      router={router} // Pass router for navigation
      theme={demoTheme} // Pass custom theme
      window={demoWindow} // Pass demo window
    >
      <DashboardLayout
        defaultSidebarCollapsed // Start with collapsed sidebar
        slots={{
          appTitle: CustomAppTitle, // Custom app title component
          toolbarActions: ToolbarActionsSearch, // Toolbar actions component
          sidebarFooter: SidebarFooter, // Sidebar footer component
        }}
      >
        {/* Render page content based on pathname */}
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

// PropTypes for DashboardLayoutSlots component
DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
};

// Export the component as default
export default DashboardLayoutSlots;
