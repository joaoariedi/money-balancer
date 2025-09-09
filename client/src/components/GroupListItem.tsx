import {
  Visibility,
  VisibilityOff,
  Group as GroupIcon,
} from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  IconButton,
  Typography,
  Box,
  Collapse,
  Chip,
} from '@mui/material';
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
    try {
      const timeAgo = formatDistanceToNow(lastActivity, { addSuffix: true });
      return timeAgo;
    } catch {
      // Fallback if date formatting fails
      return 'recently';
    }
  };

  const isNewGroup = group.updated_at === group.created_at;

  return (
    <Collapse in={!isAnimating} timeout={300}>
      <Card
        elevation={isHidden ? 0 : 1}
        sx={{
          opacity: isHidden ? 0.5 : 1,
          transition: 'all 0.2s ease-in-out',
          backgroundColor: isHidden
            ? 'action.disabledBackground'
            : 'background.paper',
          border: isHidden ? '1px solid' : 'none',
          borderColor: 'divider',
          '&:hover': {
            elevation: isHidden ? 0 : 3,
            boxShadow: isHidden ? 'none' : 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          <CardActionArea
            onClick={handleGroupClick}
            disabled={isHidden}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              textAlign: 'left',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: isHidden
                    ? 'action.disabled'
                    : 'primary.light',
                  color: isHidden ? 'text.disabled' : 'primary.contrastText',
                }}
              >
                <GroupIcon fontSize='medium' />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='h6'
                  component='div'
                  sx={{
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    color: isHidden ? 'text.disabled' : 'text.primary',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.name}
                </Typography>

                {(group.created_at || group.updated_at) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size='small'
                      label={isNewGroup ? 'New' : 'Active'}
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: isNewGroup
                          ? 'success.light'
                          : 'info.light',
                        color: isNewGroup
                          ? 'success.contrastText'
                          : 'info.contrastText',
                        fontWeight: 600,
                      }}
                    />
                    <Typography
                      variant='body2'
                      sx={{
                        color: isHidden ? 'text.disabled' : 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {isNewGroup ? 'Created' : 'Updated'}{' '}
                      {getLastActivityText()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </CardActionArea>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              pr: 1,
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton
              onClick={handleToggleVisibility}
              aria-label={isHidden ? 'Show group' : 'Hide group'}
              sx={{
                mx: 1,
                color: isHidden ? 'text.disabled' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'primary.main',
                },
              }}
            >
              {isHidden ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Box>
        </Box>
      </Card>
    </Collapse>
  );
}
