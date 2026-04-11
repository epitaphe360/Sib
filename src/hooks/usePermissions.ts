import useAuthStore from '@/store/authStore';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const isAdmin = user?.type === 'admin';
  const isExhibitor = user?.type === 'exhibitor';
  const isPartner = user?.type === 'partner';
  const isVisitor = user?.type === 'visitor';

  return { 
    user, 
    isAdmin, 
    isExhibitor,
    isPartner,
    isVisitor,
    isAuthenticated: !!user 
  };
};
