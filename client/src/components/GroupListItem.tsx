import { ChevronRight, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, IconButton, Typography, Box, Collapse } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../data/Types';

interface GroupListItemProps {
  group: Group;
  isHidden?: boolean;
  onToggleVisibility: (groupId: string) => void;
}

export default function GroupListItem({
  group,
  isHidden = false,
  onToggleVisibility,
}: GroupListItemProps) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleVisibility = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggleVisibility(group.id);
      setIsAnimating(false);
    }, 150); // Short delay for visual feedback
  };

  const handleGroupClick = () => {
    if (!isHidden) {
      navigate(`/group/${group.id}`);
    }
  };

  const getLastActivityText = () => {
    // Convert timestamp to milliseconds for date-fns
    const lastActivity = new Date(
      (group.updated_at || group.created_at) * 1000,
    );

    // Show "created" text for new groups (updated_at equals created_at)
    const isNewGroup = group.updated_at === group.created_at;

    try {
      const timeAgo = formatDistanceToNow(lastActivity, { addSuffix: true });
      return isNewGroup ? `Created ${timeAgo}` : `Last activity ${timeAgo}`;
    } catch {
      // Fallback if date formatting fails
      return isNewGroup ? 'Recently created' : 'Recently active';
    }
  };

  return (
    <Collapse in={!isAnimating} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          opacity: isHidden ? 0.6 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <Button
          onClick={handleGroupClick}
          variant={isHidden ? 'outlined' : 'contained'}
          endIcon={!isHidden ? <ChevronRight /> : undefined}
          fullWidth
          disabled={isHidden}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            minHeight: 48,
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant='body1' component='span'>
              {group.name}
            </Typography>
            {(group.created_at || group.updated_at) && (
              <Typography
                variant='caption'
                component='span'
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  mt: 0.25,
                }}
              >
                {getLastActivityText()}
              </Typography>
            )}
          </Box>
        </Button>

        <IconButton
          onClick={handleToggleVisibility}
          size='small'
          aria-label={isHidden ? 'Show group' : 'Hide group'}
          sx={{
            minWidth: 40,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {isHidden ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Box>
    </Collapse>
  );
}
