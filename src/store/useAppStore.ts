import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Player, Room, PlayerProfile, SwapRequest, SwapImpact } from '@/types';

interface AppState {
  currentUser: Player | null;
  currentRoom: Room | null;
  rooms: Room[];
  setCurrentUser: (user: Player) => void;
  setCurrentRoom: (room: Room | null) => void;
  updateUserProfile: (profile: PlayerProfile) => void;
  createRoom: (scriptName: string, roleCount: number) => Room;
  joinRoom: (code: string) => Room | null;
  leaveRoom: () => void;
  addPlayerToRoom: (player: Player) => void;
  removePlayerFromRoom: (playerId: string) => void;
  updateRoomStatus: (status: Room['status']) => void;
  setAssignedRoles: (roles: Record<string, string>) => void;
  requestSwap: (toPlayerId: string, fromRole: string, toRole: string, impact: SwapImpact) => SwapRequest | null;
  respondToSwap: (requestId: string, accepted: boolean) => void;
  hasPendingSwapBetween: (fromPlayerId: string, toPlayerId: string) => boolean;
}

const mockUsers: Player[] = [
  { id: '1', name: '小明', avatar: 'https://picsum.photos/id/64/200/200', profile: null, role: null, isHost: false },
  { id: '2', name: '小红', avatar: 'https://picsum.photos/id/91/200/200', profile: null, role: null, isHost: false },
  { id: '3', name: '小刚', avatar: 'https://picsum.photos/id/177/200/200', profile: null, role: null, isHost: false },
  { id: '4', name: '小丽', avatar: 'https://picsum.photos/id/338/200/200', profile: null, role: null, isHost: false },
];

const generateRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const mockRooms: Room[] = [
  {
    id: 'room1',
    code: 'ABC123',
    hostId: '1',
    scriptName: '窗边的女人',
    roleCount: 6,
    players: [mockUsers[0]],
    status: 'waiting',
    assignedRoles: null,
    swapRequests: [],
    createdAt: Date.now()
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentRoom: null,
  rooms: mockRooms,

  setCurrentUser: (user: Player) => {
    set({ currentUser: user });
    console.log('[Auth] 用户已设置:', user.name);
  },

  setCurrentRoom: (room: Room | null) => {
    set({ currentRoom: room });
    console.log('[Room] 当前房间已更新:', room?.code || 'null');
  },

  updateUserProfile: (profile: PlayerProfile) => {
    set((state) => {
      if (!state.currentUser) return {};
      const userId = state.currentUser.id;
      const updatedUser = { ...state.currentUser, profile };

      const updatedRooms = state.rooms.map(room => {
        const hasPlayer = room.players.some(p => p.id === userId);
        if (!hasPlayer) return room;

        const updatedPlayers = room.players.map(p =>
          p.id === userId ? { ...p, profile } : p
        );

        return { ...room, players: updatedPlayers };
      });

      const updatedCurrentRoom = state.currentRoom
        ? updatedRooms.find(r => r.id === state.currentRoom!.id) || null
        : null;

      console.log('[Profile] 用户画像已更新并同步至房间:', profile.name);
      return {
        currentUser: updatedUser,
        rooms: updatedRooms,
        currentRoom: updatedCurrentRoom
      };
    });
  },

  hasPendingSwapBetween: (fromPlayerId: string, toPlayerId: string): boolean => {
    const state = get();
    if (!state.currentRoom) return false;
    return state.currentRoom.swapRequests.some(req =>
      req.status === 'pending' &&
      (
        (req.fromPlayerId === fromPlayerId && req.toPlayerId === toPlayerId) ||
        (req.fromPlayerId === toPlayerId && req.toPlayerId === fromPlayerId)
      )
    );
  },

  createRoom: (scriptName: string, roleCount: number): Room => {
    const state = get();
    const currentUser = state.currentUser || mockUsers[0];
    
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      code: generateRoomCode(),
      hostId: currentUser.id,
      scriptName,
      roleCount,
      players: [{ ...currentUser, isHost: true }],
      status: 'waiting',
      assignedRoles: null,
      swapRequests: [],
      createdAt: Date.now()
    };

    set((state) => ({
      rooms: [...state.rooms, newRoom],
      currentRoom: newRoom
    }));

    console.log('[Room] 房间已创建:', newRoom.code);
    return newRoom;
  },

  joinRoom: (code: string): Room | null => {
    const state = get();
    const room = state.rooms.find(r => r.code === code.toUpperCase());
    
    if (!room) {
      console.error('[Room] 房间不存在:', code);
      return null;
    }

    if (room.players.length >= room.roleCount) {
      console.error('[Room] 房间已满');
      return null;
    }

    const currentUser = state.currentUser || mockUsers[1];
    const updatedPlayers = [...room.players, { ...currentUser, isHost: false }];
    const updatedRoom = { ...room, players: updatedPlayers };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === room.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Room] 已加入房间:', room.code);
    return updatedRoom;
  },

  leaveRoom: () => {
    const state = get();
    const currentUser = state.currentUser;
    const currentRoom = state.currentRoom;

    if (!currentRoom || !currentUser) return;

    const updatedPlayers = currentRoom.players.filter(p => p.id !== currentUser.id);
    const updatedRoom = { ...currentRoom, players: updatedPlayers };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === currentRoom.id ? updatedRoom : r),
      currentRoom: null
    }));

    console.log('[Room] 已离开房间');
  },

  addPlayerToRoom: (player: Player) => {
    const state = get();
    if (!state.currentRoom) return;

    const updatedRoom = {
      ...state.currentRoom,
      players: [...state.currentRoom.players, player]
    };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Room] 玩家已加入:', player.name);
  },

  removePlayerFromRoom: (playerId: string) => {
    const state = get();
    if (!state.currentRoom) return;

    const updatedRoom = {
      ...state.currentRoom,
      players: state.currentRoom.players.filter(p => p.id !== playerId)
    };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Room] 玩家已移除:', playerId);
  },

  updateRoomStatus: (status: Room['status']) => {
    const state = get();
    if (!state.currentRoom) return;

    const updatedRoom = { ...state.currentRoom, status };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Room] 状态已更新:', status);
  },

  setAssignedRoles: (roles: Record<string, string>) => {
    const state = get();
    if (!state.currentRoom) return;

    const updatedPlayers = state.currentRoom.players.map(p => ({
      ...p,
      role: roles[p.id] || null
    }));

    const updatedRoom = {
      ...state.currentRoom,
      players: updatedPlayers,
      assignedRoles: roles,
      status: 'matched'
    };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Room] 角色已分配:', roles);
  },

  requestSwap: (toPlayerId: string, fromRole: string, toRole: string, impact: SwapImpact): SwapRequest | null => {
    const state = get();
    if (!state.currentRoom || !state.currentUser) return null;

    const fromPlayerId = state.currentUser.id;

    if (state.hasPendingSwapBetween(fromPlayerId, toPlayerId)) {
      console.log('[Swap] 双方之间已有待处理请求，拒绝重复发送');
      Taro.showToast({ title: '已有待处理的换角请求', icon: 'none' });
      return null;
    }

    const request: SwapRequest = {
      id: `swap_${Date.now()}`,
      fromPlayerId,
      toPlayerId,
      fromRole,
      toRole,
      impact,
      status: 'pending',
      createdAt: Date.now()
    };

    const updatedRoom = {
      ...state.currentRoom,
      swapRequests: [...state.currentRoom.swapRequests, request]
    };

    set((state) => ({
      rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
      currentRoom: updatedRoom
    }));

    console.log('[Swap] 换角请求已发送:', request.id);
    return request;
  },

  respondToSwap: (requestId: string, accepted: boolean) => {
    const state = get();
    if (!state.currentRoom) return;

    const request = state.currentRoom.swapRequests.find(r => r.id === requestId);
    if (!request) return;

    if (accepted) {
      const updatedPlayers = state.currentRoom.players.map(p => {
        if (p.id === request.fromPlayerId) return { ...p, role: request.toRole };
        if (p.id === request.toPlayerId) return { ...p, role: request.fromRole };
        return p;
      });

      const updatedRoles = { ...state.currentRoom.assignedRoles };
      if (updatedRoles) {
        updatedRoles[request.fromPlayerId] = request.toRole;
        updatedRoles[request.toPlayerId] = request.fromRole;
      }

      const updatedRoom = {
        ...state.currentRoom,
        players: updatedPlayers,
        assignedRoles: updatedRoles,
        swapRequests: state.currentRoom.swapRequests.map(r =>
          r.id === requestId ? { ...r, status: 'accepted' as const } : r
        )
      };

      set((state) => ({
        rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
        currentRoom: updatedRoom
      }));

      console.log('[Swap] 换角已接受');
    } else {
      const updatedRoom = {
        ...state.currentRoom,
        swapRequests: state.currentRoom.swapRequests.map(r =>
          r.id === requestId ? { ...r, status: 'rejected' as const } : r
        )
      };

      set((state) => ({
        rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r),
        currentRoom: updatedRoom
      }));

      console.log('[Swap] 换角已拒绝');
    }
  }
}));
