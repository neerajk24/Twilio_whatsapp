// src/utils/sortUsersWithUnread.js
export const sortUsersWithUnread = (users, unreadCount) => {
    const usersWithUnread = users.filter(user => unreadCount.some(item => item.phone === user.phoneNumber && item.unreadCount > 0));
    const usersWithoutUnread = users.filter(user => !unreadCount.some(item => item.phone === user.phoneNumber && item.unreadCount > 0));

    usersWithUnread.sort((a, b) => {
        const unreadA = unreadCount.find(item => item.phone === a.phoneNumber)?.unreadCount || 0;
        const unreadB = unreadCount.find(item => item.phone === b.phoneNumber)?.unreadCount || 0;
        return unreadB - unreadA;
    });

    return [...usersWithUnread, ...usersWithoutUnread];
};
