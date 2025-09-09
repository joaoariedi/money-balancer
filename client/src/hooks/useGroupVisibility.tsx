import { useState, useEffect, useCallback } from 'react';

interface GroupVisibilityState {
  [groupId: string]: boolean;
}

const STORAGE_KEY = 'money-balancer-hidden-groups';

export interface UseGroupVisibilityReturn {
  hiddenGroups: GroupVisibilityState;
  isGroupHidden: (groupId: string) => boolean;
  hideGroup: (groupId: string) => void;
  showGroup: (groupId: string) => void;
  toggleGroupVisibility: (groupId: string) => void;
  getHiddenGroupIds: () => string[];
  showAllGroups: () => void;
}

export function useGroupVisibility(): UseGroupVisibilityReturn {
  const [hiddenGroups, setHiddenGroups] = useState<GroupVisibilityState>({});

  // Load hidden groups from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GroupVisibilityState;
        setHiddenGroups(parsed);
      }
    } catch (error) {
      console.warn('Failed to load hidden groups from localStorage:', error);
      // Continue with empty state if localStorage fails
    }
  }, []);

  // Save hidden groups to localStorage whenever state changes
  const saveToStorage = useCallback((newState: GroupVisibilityState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save hidden groups to localStorage:', error);
      // Continue without persisting if localStorage fails
    }
  }, []);

  const isGroupHidden = useCallback(
    (groupId: string): boolean => {
      return hiddenGroups[groupId] === true;
    },
    [hiddenGroups],
  );

  const hideGroup = useCallback(
    (groupId: string) => {
      const newState = { ...hiddenGroups, [groupId]: true };
      setHiddenGroups(newState);
      saveToStorage(newState);
    },
    [hiddenGroups, saveToStorage],
  );

  const showGroup = useCallback(
    (groupId: string) => {
      const newState = { ...hiddenGroups };
      delete newState[groupId];
      setHiddenGroups(newState);
      saveToStorage(newState);
    },
    [hiddenGroups, saveToStorage],
  );

  const toggleGroupVisibility = useCallback(
    (groupId: string) => {
      if (isGroupHidden(groupId)) {
        showGroup(groupId);
      } else {
        hideGroup(groupId);
      }
    },
    [isGroupHidden, showGroup, hideGroup],
  );

  const getHiddenGroupIds = useCallback((): string[] => {
    return Object.keys(hiddenGroups).filter(groupId => hiddenGroups[groupId]);
  }, [hiddenGroups]);

  const showAllGroups = useCallback(() => {
    setHiddenGroups({});
    saveToStorage({});
  }, [saveToStorage]);

  return {
    hiddenGroups,
    isGroupHidden,
    hideGroup,
    showGroup,
    toggleGroupVisibility,
    getHiddenGroupIds,
    showAllGroups,
  };
}
