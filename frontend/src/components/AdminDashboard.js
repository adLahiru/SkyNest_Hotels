import React, { useState, useEffect } from 'react';
import { Users, Building2, DollarSign, TrendingUp, Calendar, BarChart3, Plus, Edit, Trash2, Search, Filter, X, Eye, EyeOff, Home, Bed, Upload } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import userService from '../services/userService';
import branchService from '../services/branchService';
import roomService from '../services/roomService';
import roomTypeService from '../services/roomTypeService';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // User management states
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic_no: '',
    username: '',
    password: '',
    role: '',
    branch_id: '',
    hire_date: '',
    salary: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const USER_ROLES = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'GUEST'];

  // Room management states
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomStateFilter, setRoomStateFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [roomBranchFilter, setRoomBranchFilter] = useState('');
  const [roomFloorFilter, setRoomFloorFilter] = useState('');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showDeleteRoomConfirmModal, setShowDeleteRoomConfirmModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    room_no: '',
    floor_no: '',
    room_type_id: '',
    branch_id: '',
    state: 'available'
  });
  const [roomFormErrors, setRoomFormErrors] = useState({});
  const [roomSubmitMessage, setRoomSubmitMessage] = useState({ type: '', text: '' });

  const ROOM_STATES = ['available', 'occupied', 'maintenance'];

  // Room Type management states
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [roomTypeSearchQuery, setRoomTypeSearchQuery] = useState('');
  const [minCapacityFilter, setMinCapacityFilter] = useState('');
  const [maxCapacityFilter, setMaxCapacityFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [showAddRoomTypeModal, setShowAddRoomTypeModal] = useState(false);
  const [showEditRoomTypeModal, setShowEditRoomTypeModal] = useState(false);
  const [showDeleteRoomTypeConfirmModal, setShowDeleteRoomTypeConfirmModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [roomTypeFormData, setRoomTypeFormData] = useState({
    type: '',
    capacity: '',
    daily_rate: '',
    amenities: '',
    description: '',
    photo: ''
  });
  const [roomTypeFormErrors, setRoomTypeFormErrors] = useState({});
  const [roomTypeSubmitMessage, setRoomTypeSubmitMessage] = useState({ type: '', text: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchBranches();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'rooms') {
      fetchRooms();
    } else if (activeTab === 'roomTypes') {
      fetchRoomTypes();
    }
  }, [activeTab, searchQuery, roleFilter, roomSearchQuery, roomStateFilter, roomTypeFilter, roomBranchFilter, roomFloorFilter, roomTypeSearchQuery, minCapacityFilter, maxCapacityFilter, minPriceFilter, maxPriceFilter]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    const result = await dashboardService.getAdminStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (roleFilter) filters.role = roleFilter;
    
    const result = await userService.getAllUsers(filters);
    if (result.success) {
      setUsers(result.users);
    } else {
      console.error('Failed to fetch users:', result.message);
    }
    setLoadingUsers(false);
  };

  const fetchBranches = async () => {
    const result = await branchService.getAllBranches();
    if (result.success) {
      setBranches(result.branches);
    }
  };

  const fetchRoomTypes = async () => {
    setLoadingRoomTypes(true);
    const result = await roomTypeService.getAllRoomTypes();
    if (result.success) {
      let filteredTypes = result.roomTypes || [];
      
      // Apply search filter
      if (roomTypeSearchQuery) {
        filteredTypes = filteredTypes.filter(type =>
          type.type.toLowerCase().includes(roomTypeSearchQuery.toLowerCase())
        );
      }
      
      // Apply capacity filters
      if (minCapacityFilter) {
        filteredTypes = filteredTypes.filter(type => type.capacity >= parseInt(minCapacityFilter));
      }
      if (maxCapacityFilter) {
        filteredTypes = filteredTypes.filter(type => type.capacity <= parseInt(maxCapacityFilter));
      }
      
      // Apply price filters
      if (minPriceFilter) {
        filteredTypes = filteredTypes.filter(type => type.daily_rate >= parseFloat(minPriceFilter));
      }
      if (maxPriceFilter) {
        filteredTypes = filteredTypes.filter(type => type.daily_rate <= parseFloat(maxPriceFilter));
      }
      
      setRoomTypes(filteredTypes);
    } else {
      console.error('Failed to fetch room types:', result.message);
    }
    setLoadingRoomTypes(false);
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    const filters = {};
    if (roomStateFilter) filters.state = roomStateFilter;
    if (roomTypeFilter) filters.room_type_id = roomTypeFilter;
    if (roomBranchFilter) filters.branch_id = roomBranchFilter;
    if (roomFloorFilter) filters.floor_no = roomFloorFilter;
    
    const result = await roomService.getAllRooms(filters);
    if (result.success) {
      let filteredRooms = result.rooms.rooms || [];
      
      // Apply search filter on room number
      if (roomSearchQuery) {
        filteredRooms = filteredRooms.filter(room =>
          room.room_no.toLowerCase().includes(roomSearchQuery.toLowerCase())
        );
      }
      
      setRooms(filteredRooms);
    } else {
      console.error('Failed to fetch rooms:', result.message);
    }
    setLoadingRooms(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
  };

  const handleAddUserClick = () => {
    setShowAddUserModal(true);
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      nic_no: '',
      username: '',
      password: '',
      role: '',
      branch_id: '',
      hire_date: '',
      salary: ''
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userFormData.name.trim()) errors.name = 'Name is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!userFormData.nic_no.trim()) errors.nic_no = 'NIC number is required';
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.password.trim()) errors.password = 'Password is required';
    else if (userFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!userFormData.role) errors.role = 'Role is required';
    if (userFormData.role && userFormData.role !== 'GUEST' && !userFormData.branch_id) {
      errors.branch_id = 'Branch is required for staff roles';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoadingUsers(true);
    setSubmitMessage({ type: '', text: '' });

    // Prepare data
    const userData = {
      name: userFormData.name,
      email: userFormData.email,
      phone: userFormData.phone || undefined,
      nic_no: userFormData.nic_no,
      username: userFormData.username,
      password: userFormData.password,
      role: userFormData.role,
      branch_id: userFormData.role !== 'GUEST' ? userFormData.branch_id : undefined,
      hire_date: userFormData.hire_date || undefined,
      salary: userFormData.salary ? parseFloat(userFormData.salary) : undefined
    };

    const result = await userService.createUser(userData);
    
    if (result.success) {
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowAddUserModal(false);
        fetchUsers();
        fetchDashboardStats(); // Refresh stats
      }, 1500);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleEditUserClick = (userItem) => {
    setSelectedUser(userItem);
    setShowEditUserModal(true);
    setUserFormData({
      name: userItem.name || '',
      email: userItem.email || '',
      phone: userItem.phone || '',
      nic_no: userItem.nic_no || '',
      username: userItem.username || '',
      password: '', // Don't pre-fill password
      role: userItem.role || '',
      branch_id: userItem.branch_id || '',
      hire_date: userItem.hire_date ? new Date(userItem.hire_date).toISOString().split('T')[0] : '',
      salary: userItem.salary || ''
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!userFormData.name.trim()) errors.name = 'Name is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.role) errors.role = 'Role is required';
    if (userFormData.role && userFormData.role !== 'GUEST' && !userFormData.branch_id) {
      errors.branch_id = 'Branch is required for staff roles';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEditUser = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    setLoadingUsers(true);
    setSubmitMessage({ type: '', text: '' });

    // Prepare data (password is optional for updates)
    const userData = {
      name: userFormData.name,
      email: userFormData.email,
      phone: userFormData.phone || undefined,
      nic_no: userFormData.nic_no,
      username: userFormData.username,
      role: userFormData.role,
      branch_id: userFormData.role !== 'GUEST' ? userFormData.branch_id : undefined,
      hire_date: userFormData.hire_date || undefined,
      salary: userFormData.salary ? parseFloat(userFormData.salary) : undefined
    };

    const result = await userService.updateUser(selectedUser.user_id, userData);
    
    if (result.success) {
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchDashboardStats(); // Refresh stats
      }, 1500);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleDeleteUserClick = (userItem) => {
    setSelectedUser(userItem);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setLoadingUsers(true);
    const result = await userService.deleteUser(selectedUser.user_id);
    
    if (result.success) {
      setShowDeleteConfirmModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchDashboardStats(); // Refresh stats
      
      // Show success message briefly
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setSubmitMessage({ type: '', text: '' });
      }, 3000);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setSelectedUser(null);
  };

  // Room Management Functions
  const handleRoomSearchChange = (e) => {
    setRoomSearchQuery(e.target.value);
  };

  const handleRoomStateFilterChange = (e) => {
    setRoomStateFilter(e.target.value);
  };

  const handleRoomTypeFilterChange = (e) => {
    setRoomTypeFilter(e.target.value);
  };

  const handleRoomBranchFilterChange = (e) => {
    setRoomBranchFilter(e.target.value);
  };

  const handleRoomFloorFilterChange = (e) => {
    setRoomFloorFilter(e.target.value);
  };

  const clearRoomFilters = () => {
    setRoomSearchQuery('');
    setRoomStateFilter('');
    setRoomTypeFilter('');
    setRoomBranchFilter('');
    setRoomFloorFilter('');
  };

  const handleAddRoomClick = () => {
    setShowAddRoomModal(true);
    setRoomFormData({
      room_no: '',
      floor_no: '',
      room_type_id: '',
      branch_id: '',
      state: 'available'
    });
    setRoomFormErrors({});
    setRoomSubmitMessage({ type: '', text: '' });
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (roomFormErrors[name]) {
      setRoomFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateRoomForm = () => {
    const errors = {};
    
    if (!roomFormData.room_no.trim()) errors.room_no = 'Room number is required';
    if (roomFormData.floor_no === '' || roomFormData.floor_no < 0) {
      errors.floor_no = 'Floor number must be 0 or greater';
    }
    if (!roomFormData.room_type_id) errors.room_type_id = 'Room type is required';
    if (!roomFormData.branch_id) errors.branch_id = 'Branch is required';
    if (!roomFormData.state) errors.state = 'State is required';
    
    setRoomFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    
    if (!validateRoomForm()) {
      return;
    }

    setLoadingRooms(true);
    
    const result = await roomService.createRoom({
      ...roomFormData,
      floor_no: parseInt(roomFormData.floor_no)
    });
    
    if (result.success) {
      setRoomSubmitMessage({ type: 'success', text: result.message || 'Room created successfully!' });
      setTimeout(() => {
        setShowAddRoomModal(false);
        fetchRooms();
        fetchDashboardStats();
      }, 1500);
    } else {
      setRoomSubmitMessage({ type: 'error', text: result.message || 'Failed to create room' });
    }
    
    setLoadingRooms(false);
  };

  const handleEditRoomClick = (room) => {
    setSelectedRoom(room);
    setRoomFormData({
      room_no: room.room_no,
      floor_no: room.floor_no.toString(),
      room_type_id: room.room_type_id,
      branch_id: room.branch_id,
      state: room.state
    });
    setRoomFormErrors({});
    setRoomSubmitMessage({ type: '', text: '' });
    setShowEditRoomModal(true);
  };

  const handleSubmitEditRoom = async (e) => {
    e.preventDefault();
    
    if (!validateRoomForm()) {
      return;
    }

    setLoadingRooms(true);
    
    const result = await roomService.updateRoom(selectedRoom.room_id, {
      ...roomFormData,
      floor_no: parseInt(roomFormData.floor_no)
    });
    
    if (result.success) {
      setRoomSubmitMessage({ type: 'success', text: result.message || 'Room updated successfully!' });
      setTimeout(() => {
        setShowEditRoomModal(false);
        setSelectedRoom(null);
        fetchRooms();
        fetchDashboardStats();
      }, 1500);
    } else {
      setRoomSubmitMessage({ type: 'error', text: result.message || 'Failed to update room' });
    }
    
    setLoadingRooms(false);
  };

  const handleDeleteRoomClick = (room) => {
    setSelectedRoom(room);
    setShowDeleteRoomConfirmModal(true);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!selectedRoom) return;

    setLoadingRooms(true);
    
    const result = await roomService.deleteRoom(selectedRoom.room_id);
    
    if (result.success) {
      setShowDeleteRoomConfirmModal(false);
      setSelectedRoom(null);
      setTimeout(() => {
        fetchRooms();
        fetchDashboardStats();
      }, 500);
    } else {
      setRoomSubmitMessage({ type: 'error', text: result.message || 'Failed to delete room' });
    }
    
    setLoadingRooms(false);
  };

  const handleCancelDeleteRoom = () => {
    setShowDeleteRoomConfirmModal(false);
    setSelectedRoom(null);
  };

  const getRoomStateBadgeColor = (state) => {
    switch(state) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Room Type Management Functions
  const handleRoomTypeSearchChange = (e) => {
    setRoomTypeSearchQuery(e.target.value);
  };

  const handleMinCapacityFilterChange = (e) => {
    setMinCapacityFilter(e.target.value);
  };

  const handleMaxCapacityFilterChange = (e) => {
    setMaxCapacityFilter(e.target.value);
  };

  const handleMinPriceFilterChange = (e) => {
    setMinPriceFilter(e.target.value);
  };

  const handleMaxPriceFilterChange = (e) => {
    setMaxPriceFilter(e.target.value);
  };

  const clearRoomTypeFilters = () => {
    setRoomTypeSearchQuery('');
    setMinCapacityFilter('');
    setMaxCapacityFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
  };

  // Photo handling functions
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processImageFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setRoomTypeFormErrors(prev => ({
        ...prev,
        photo: 'Please upload an image file'
      }));
      return;
    }

    // Validate file size (max 10MB for original file)
    if (file.size > 10 * 1024 * 1024) {
      setRoomTypeFormErrors(prev => ({
        ...prev,
        photo: 'Image size must be less than 10MB'
      }));
      return;
    }

    // Clear any previous photo errors
    setRoomTypeFormErrors(prev => ({
      ...prev,
      photo: ''
    }));

    try {
      // Compress image if larger than 500KB
      let processedFile = file;
      if (file.size > 500 * 1024) {
        const compressedBlob = await compressImage(file);
        processedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        // Show compression info
        console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(processedFile.size / 1024).toFixed(2)}KB`);
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setRoomTypeFormData(prev => ({
          ...prev,
          photo: base64String
        }));
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setRoomTypeFormErrors(prev => ({
        ...prev,
        photo: 'Failed to process image. Please try another file.'
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setRoomTypeFormData(prev => ({
      ...prev,
      photo: ''
    }));
  };

  const handleAddRoomTypeClick = () => {
    setShowAddRoomTypeModal(true);
    setRoomTypeFormData({
      type: '',
      capacity: '',
      daily_rate: '',
      amenities: '',
      description: '',
      photo: ''
    });
    setPhotoPreview(null);
    setRoomTypeFormErrors({});
    setRoomTypeSubmitMessage({ type: '', text: '' });
  };

  const handleRoomTypeFormChange = (e) => {
    const { name, value } = e.target;
    setRoomTypeFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (roomTypeFormErrors[name]) {
      setRoomTypeFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateRoomTypeForm = () => {
    const errors = {};
    
    if (!roomTypeFormData.type.trim()) errors.type = 'Room type name is required';
    if (!roomTypeFormData.capacity || roomTypeFormData.capacity < 1 || roomTypeFormData.capacity > 20) {
      errors.capacity = 'Capacity must be between 1 and 20';
    }
    if (!roomTypeFormData.daily_rate || roomTypeFormData.daily_rate < 0) {
      errors.daily_rate = 'Daily rate must be a positive number';
    }
    
    setRoomTypeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRoomType = async (e) => {
    e.preventDefault();
    
    if (!validateRoomTypeForm()) {
      return;
    }

    setLoadingRoomTypes(true);
    
    const result = await roomTypeService.createRoomType({
      ...roomTypeFormData,
      capacity: parseInt(roomTypeFormData.capacity),
      daily_rate: parseFloat(roomTypeFormData.daily_rate)
    });
    
    if (result.success) {
      setRoomTypeSubmitMessage({ type: 'success', text: result.message || 'Room type created successfully!' });
      setTimeout(() => {
        setShowAddRoomTypeModal(false);
        fetchRoomTypes();
        fetchDashboardStats();
      }, 1500);
    } else {
      setRoomTypeSubmitMessage({ type: 'error', text: result.message || 'Failed to create room type' });
    }
    
    setLoadingRoomTypes(false);
  };

  const handleEditRoomTypeClick = (roomType) => {
    setSelectedRoomType(roomType);
    setRoomTypeFormData({
      type: roomType.type,
      capacity: roomType.capacity.toString(),
      daily_rate: roomType.daily_rate.toString(),
      amenities: roomType.amenities || '',
      description: roomType.description || '',
      photo: roomType.photo || ''
    });
    setPhotoPreview(roomType.photo || null);
    setRoomTypeFormErrors({});
    setRoomTypeSubmitMessage({ type: '', text: '' });
    setShowEditRoomTypeModal(true);
  };

  const handleSubmitEditRoomType = async (e) => {
    e.preventDefault();
    
    if (!validateRoomTypeForm()) {
      return;
    }

    setLoadingRoomTypes(true);
    
    const result = await roomTypeService.updateRoomType(selectedRoomType.room_type_id, {
      ...roomTypeFormData,
      capacity: parseInt(roomTypeFormData.capacity),
      daily_rate: parseFloat(roomTypeFormData.daily_rate)
    });
    
    if (result.success) {
      setRoomTypeSubmitMessage({ type: 'success', text: result.message || 'Room type updated successfully!' });
      setTimeout(() => {
        setShowEditRoomTypeModal(false);
        setSelectedRoomType(null);
        fetchRoomTypes();
        fetchDashboardStats();
      }, 1500);
    } else {
      setRoomTypeSubmitMessage({ type: 'error', text: result.message || 'Failed to update room type' });
    }
    
    setLoadingRoomTypes(false);
  };

  const handleDeleteRoomTypeClick = (roomType) => {
    setSelectedRoomType(roomType);
    setShowDeleteRoomTypeConfirmModal(true);
  };

  const handleConfirmDeleteRoomType = async () => {
    if (!selectedRoomType) return;

    setLoadingRoomTypes(true);
    
    const result = await roomTypeService.deleteRoomType(selectedRoomType.room_type_id);
    
    if (result.success) {
      setShowDeleteRoomTypeConfirmModal(false);
      setSelectedRoomType(null);
      setTimeout(() => {
        fetchRoomTypes();
        fetchDashboardStats();
      }, 500);
    } else {
      setRoomTypeSubmitMessage({ type: 'error', text: result.message || 'Failed to delete room type' });
    }
    
    setLoadingRoomTypes(false);
  };

  const handleCancelDeleteRoomType = () => {
    setShowDeleteRoomTypeConfirmModal(false);
    setSelectedRoomType(null);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'RECEPTIONIST': return 'bg-green-100 text-green-800';
      case 'HOUSEKEEPING': return 'bg-yellow-100 text-yellow-800';
      case 'GUEST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                <div className="h-4 bg-blue-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.users?.guests || 0} Guests • {stats?.users?.staff || 0} Staff
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Branches</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.branches?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active Locations</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${Number(stats?.revenue?.total_revenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +${Number(stats?.revenue?.monthly_revenue || 0).toLocaleString()} this month
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.bookings?.confirmed || 0} Confirmed • {stats?.bookings?.checked_in || 0} Active
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline-block mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'branches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5 inline-block mr-2" />
                Branches
              </button>
              <button
                onClick={() => setActiveTab('roomTypes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roomTypes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bed className="w-5 h-5 inline-block mr-2" />
                Room Types
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="w-5 h-5 inline-block mr-2" />
                Rooms
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline-block mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline-block mr-2" />
                Financial
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Room Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.rooms?.available || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-600">Occupied</p>
                      <p className="text-2xl font-bold text-red-600">{stats?.rooms?.occupied || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600">Maintenance</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.rooms?.maintenance || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.rooms?.total || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats?.recentBookings?.slice(0, 5).map((booking) => (
                          <tr key={booking.booking_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{booking.guest_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{booking.branch_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{booking.room_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(booking.check_in).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              ${Number(booking.total_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Branch Performance</h3>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Branch
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats?.branchWiseStats?.map((branch) => (
                        <tr key={branch.branch_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{branch.branch_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.total_rooms || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.total_bookings || 0}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            ${Number(branch.revenue || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Room Types Tab */}
            {activeTab === 'roomTypes' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Room Type Management</h3>
                  <button 
                    onClick={handleAddRoomTypeClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room Type
                  </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="w-4 h-4 inline mr-2" />
                        Search Room Types
                      </label>
                      <input
                        type="text"
                        value={roomTypeSearchQuery}
                        onChange={handleRoomTypeSearchChange}
                        placeholder="Search by type name..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Capacity Filters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Min Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={minCapacityFilter}
                        onChange={handleMinCapacityFilterChange}
                        placeholder="Min guests"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={maxCapacityFilter}
                        onChange={handleMaxCapacityFilterChange}
                        placeholder="Max guests"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Price Filters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Min Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={minPriceFilter}
                        onChange={handleMinPriceFilterChange}
                        placeholder="Min price"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxPriceFilter}
                        onChange={handleMaxPriceFilterChange}
                        placeholder="Max price"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(roomTypeSearchQuery || minCapacityFilter || maxCapacityFilter || minPriceFilter || maxPriceFilter) && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                      {roomTypeSearchQuery && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Search: {roomTypeSearchQuery}
                        </span>
                      )}
                      {minCapacityFilter && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Min Capacity: {minCapacityFilter}
                        </span>
                      )}
                      {maxCapacityFilter && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Max Capacity: {maxCapacityFilter}
                        </span>
                      )}
                      {minPriceFilter && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Min Price: ${minPriceFilter}
                        </span>
                      )}
                      {maxPriceFilter && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Max Price: ${maxPriceFilter}
                        </span>
                      )}
                      <button
                        onClick={clearRoomTypeFilters}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Room Types Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {loadingRoomTypes ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : roomTypes.length === 0 ? (
                    <div className="text-center py-12">
                      <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No room types found</p>
                      <p className="text-gray-400 text-sm">
                        {roomTypeSearchQuery || minCapacityFilter || maxCapacityFilter || minPriceFilter || maxPriceFilter
                          ? 'Try adjusting your filters'
                          : 'Add your first room type to get started'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {roomTypes.map((roomType) => (
                              <tr key={roomType.room_type_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {roomType.photo ? (
                                    <img 
                                      src={roomType.photo} 
                                      alt={roomType.type}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Bed className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{roomType.type}</div>
                                  {roomType.description && (
                                    <div className="text-xs text-gray-500 mt-1">{roomType.description.substring(0, 50)}{roomType.description.length > 50 ? '...' : ''}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    {roomType.capacity} {roomType.capacity === 1 ? 'guest' : 'guests'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-green-600">
                                    ${typeof roomType.daily_rate === 'number' ? roomType.daily_rate.toFixed(2) : roomType.daily_rate}/night
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{roomType.room_count || 0} rooms</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {roomType.amenities || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleEditRoomTypeClick(roomType)}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    <Edit className="w-4 h-4 inline" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRoomTypeClick(roomType)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{roomTypes.length}</span> room type{roomTypes.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Room Management</h3>
                  <button 
                    onClick={handleAddRoomClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room
                  </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search by Room Number */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="w-4 h-4 inline mr-2" />
                        Search Room Number
                      </label>
                      <input
                        type="text"
                        value={roomSearchQuery}
                        onChange={handleRoomSearchChange}
                        placeholder="Search by room number..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Filter by State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Filter by State
                      </label>
                      <select
                        value={roomStateFilter}
                        onChange={handleRoomStateFilterChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All States</option>
                        {ROOM_STATES.map(state => (
                          <option key={state} value={state}>
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Room Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Type
                      </label>
                      <select
                        value={roomTypeFilter}
                        onChange={handleRoomTypeFilterChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Types</option>
                        {roomTypes.map(type => (
                          <option key={type.room_type_id} value={type.room_type_id}>
                            {type.type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Branch */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Branch
                      </label>
                      <select
                        value={roomBranchFilter}
                        onChange={handleRoomBranchFilterChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Branches</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(roomSearchQuery || roomStateFilter || roomTypeFilter || roomBranchFilter || roomFloorFilter) && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-gray-600">Active Filters:</span>
                      {roomSearchQuery && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Search: {roomSearchQuery}
                        </span>
                      )}
                      {roomStateFilter && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          State: {roomStateFilter}
                        </span>
                      )}
                      {roomTypeFilter && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Type: {roomTypes.find(t => t.room_type_id === roomTypeFilter)?.type}
                        </span>
                      )}
                      {roomBranchFilter && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Branch: {branches.find(b => b.branch_id === roomBranchFilter)?.branch_name}
                        </span>
                      )}
                      <button
                        onClick={clearRoomFilters}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Rooms Table */}
                {loadingRooms ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No rooms found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {roomSearchQuery || roomStateFilter || roomTypeFilter || roomBranchFilter
                        ? 'Try adjusting your search filters'
                        : 'Get started by adding your first room'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 text-sm text-gray-600">
                      Showing {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Room No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Floor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Daily Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              State
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rooms.map((room) => (
                            <tr key={room.room_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{room.room_no}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{room.floor_no}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{room.room_type || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{room.branch_name || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{room.capacity || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ${room.daily_rate ? Number(room.daily_rate).toFixed(2) : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomStateBadgeColor(room.state)}`}>
                                  {room.state}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleEditRoomClick(room)}
                                  className="text-blue-600 hover:text-blue-800 mr-4"
                                  title="Edit room"
                                >
                                  <Edit className="w-4 h-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoomClick(room)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete room"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button 
                    onClick={handleAddUserClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="w-4 h-4 inline mr-2" />
                        Search Users
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, username, or NIC..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Filter by Role
                      </label>
                      <select
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Roles</option>
                        {USER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(searchQuery || roleFilter) && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {searchQuery && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Search: "{searchQuery}"
                        </span>
                      )}
                      {roleFilter && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Role: {roleFilter}
                        </span>
                      )}
                      <button
                        onClick={clearFilters}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Users Table */}
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No users found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((userItem) => (
                          <tr key={userItem.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{userItem.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.username}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {userItem.branch_name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.phone || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(userItem.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button 
                                onClick={() => handleEditUserClick(userItem)}
                                className="text-blue-600 hover:text-blue-800 mr-3" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 inline" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUserClick(userItem)}
                                className="text-red-600 hover:text-red-800" 
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                      Showing {users.length} user{users.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-700">
                        ${Number(stats?.revenue?.total_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-blue-700">
                        ${Number(stats?.revenue?.monthly_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                      <p className="text-3xl font-bold text-purple-700">
                        ${Number(stats?.revenue?.daily_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {stats?.branchWiseStats?.map((branch) => (
                      <div key={branch.branch_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{branch.branch_name}</p>
                          <p className="text-sm text-gray-600">{branch.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${Number(branch.revenue || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{branch.total_bookings || 0} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitUser} className="p-6">
                {submitMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userFormData.name}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nic_no"
                      value={userFormData.nic_no}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.nic_no ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123456789V"
                    />
                    {formErrors.nic_no && <p className="text-red-500 text-xs mt-1">{formErrors.nic_no}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="johndoe"
                    />
                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={userFormData.password}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      {USER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                  </div>

                  {/* Branch (only for non-guest roles) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={userFormData.branch_id}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {formErrors.branch_id && <p className="text-red-500 text-xs mt-1">{formErrors.branch_id}</p>}
                    </div>
                  )}

                  {/* Hire Date (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        name="hire_date"
                        value={userFormData.hire_date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Salary (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={userFormData.salary}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50000"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingUsers}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitEditUser} className="p-6">
                {submitMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userFormData.name}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIC Number
                    </label>
                    <input
                      type="text"
                      name="nic_no"
                      value={userFormData.nic_no}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                      title="NIC cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">NIC cannot be modified</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Password cannot be changed here
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use password reset feature</p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      {USER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                  </div>

                  {/* Branch (only for non-guest roles) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={userFormData.branch_id}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {formErrors.branch_id && <p className="text-red-500 text-xs mt-1">{formErrors.branch_id}</p>}
                    </div>
                  )}

                  {/* Hire Date (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        name="hire_date"
                        value={userFormData.hire_date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Salary (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={userFormData.salary}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingUsers}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete User
                </h2>
                
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {submitMessage.text && submitMessage.type === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
                    {submitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={loadingUsers}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={loadingUsers}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Modal */}
        {showAddRoomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
                  <button
                    onClick={() => setShowAddRoomModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {roomSubmitMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    roomSubmitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } text-sm`}>
                    {roomSubmitMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmitRoom} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="room_no"
                        value={roomFormData.room_no}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.room_no ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="101"
                      />
                      {roomFormErrors.room_no && <p className="text-red-500 text-xs mt-1">{roomFormErrors.room_no}</p>}
                    </div>

                    {/* Floor Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="floor_no"
                        min="0"
                        value={roomFormData.floor_no}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.floor_no ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1"
                      />
                      {roomFormErrors.floor_no && <p className="text-red-500 text-xs mt-1">{roomFormErrors.floor_no}</p>}
                    </div>

                    {/* Room Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="room_type_id"
                        value={roomFormData.room_type_id}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.room_type_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes.map(type => (
                          <option key={type.room_type_id} value={type.room_type_id}>
                            {type.type} - ${type.daily_rate}/night (Capacity: {type.capacity})
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.room_type_id && <p className="text-red-500 text-xs mt-1">{roomFormErrors.room_type_id}</p>}
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={roomFormData.branch_id}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.branch_id && <p className="text-red-500 text-xs mt-1">{roomFormErrors.branch_id}</p>}
                    </div>

                    {/* State */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        value={roomFormData.state}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {ROOM_STATES.map(state => (
                          <option key={state} value={state}>
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.state && <p className="text-red-500 text-xs mt-1">{roomFormErrors.state}</p>}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddRoomModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loadingRooms}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRooms}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loadingRooms ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Room
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Room Modal */}
        {showEditRoomModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
                  <button
                    onClick={() => {
                      setShowEditRoomModal(false);
                      setSelectedRoom(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {roomSubmitMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    roomSubmitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } text-sm`}>
                    {roomSubmitMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmitEditRoom} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="room_no"
                        value={roomFormData.room_no}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.room_no ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="101"
                      />
                      {roomFormErrors.room_no && <p className="text-red-500 text-xs mt-1">{roomFormErrors.room_no}</p>}
                    </div>

                    {/* Floor Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="floor_no"
                        min="0"
                        value={roomFormData.floor_no}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.floor_no ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1"
                      />
                      {roomFormErrors.floor_no && <p className="text-red-500 text-xs mt-1">{roomFormErrors.floor_no}</p>}
                    </div>

                    {/* Room Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="room_type_id"
                        value={roomFormData.room_type_id}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.room_type_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes.map(type => (
                          <option key={type.room_type_id} value={type.room_type_id}>
                            {type.type} - ${type.daily_rate}/night (Capacity: {type.capacity})
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.room_type_id && <p className="text-red-500 text-xs mt-1">{roomFormErrors.room_type_id}</p>}
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={roomFormData.branch_id}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.branch_id && <p className="text-red-500 text-xs mt-1">{roomFormErrors.branch_id}</p>}
                    </div>

                    {/* State */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        value={roomFormData.state}
                        onChange={handleRoomFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomFormErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {ROOM_STATES.map(state => (
                          <option key={state} value={state}>
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                          </option>
                        ))}
                      </select>
                      {roomFormErrors.state && <p className="text-red-500 text-xs mt-1">{roomFormErrors.state}</p>}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditRoomModal(false);
                        setSelectedRoom(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loadingRooms}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRooms}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loadingRooms ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Room
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Confirmation Modal */}
        {showDeleteRoomConfirmModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Room
                </h2>
                
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete this room? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Room Number:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRoom.room_no}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRoom.room_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Branch:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRoom.branch_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">State:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoomStateBadgeColor(selectedRoom.state)}`}>
                      {selectedRoom.state}
                    </span>
                  </div>
                </div>

                {roomSubmitMessage.text && roomSubmitMessage.type === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
                    {roomSubmitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDeleteRoom}
                    disabled={loadingRooms}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteRoom}
                    disabled={loadingRooms}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingRooms ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Type Modal */}
        {showAddRoomTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Room Type</h2>
                  <button
                    onClick={() => setShowAddRoomTypeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {roomTypeSubmitMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    roomTypeSubmitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } text-sm`}>
                    {roomTypeSubmitMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmitRoomType} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={roomTypeFormData.type}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Deluxe Suite, Standard Room"
                      />
                      {roomTypeFormErrors.type && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.type}</p>}
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        max="20"
                        value={roomTypeFormData.capacity}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.capacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Number of guests (1-20)"
                      />
                      {roomTypeFormErrors.capacity && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.capacity}</p>}
                    </div>

                    {/* Daily Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Rate ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="daily_rate"
                        min="0"
                        step="0.01"
                        value={roomTypeFormData.daily_rate}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.daily_rate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Price per night"
                      />
                      {roomTypeFormErrors.daily_rate && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.daily_rate}</p>}
                    </div>

                    {/* Amenities */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities
                      </label>
                      <input
                        type="text"
                        name="amenities"
                        value={roomTypeFormData.amenities}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., WiFi, TV, Mini Bar, Air Conditioning"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={roomTypeFormData.description}
                        onChange={handleRoomTypeFormChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe this room type..."
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type Photo
                      </label>
                      
                      {!photoPreview ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragging 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="file"
                            id="photoUpload"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <label htmlFor="photoUpload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              <Upload className="w-12 h-12 text-gray-400" />
                              <p className="text-gray-600 font-medium">
                                Drag and drop an image here, or click to select
                              </p>
                              <p className="text-gray-400 text-sm">
                                Supports: JPG, PNG, GIF (max 10MB - auto-compressed)
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Room type preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      
                      {roomTypeFormErrors.photo && (
                        <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.photo}</p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddRoomTypeModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loadingRoomTypes}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRoomTypes}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loadingRoomTypes ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Room Type
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Room Type Modal */}
        {showEditRoomTypeModal && selectedRoomType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Room Type</h2>
                  <button
                    onClick={() => {
                      setShowEditRoomTypeModal(false);
                      setSelectedRoomType(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {roomTypeSubmitMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    roomTypeSubmitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } text-sm`}>
                    {roomTypeSubmitMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmitEditRoomType} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={roomTypeFormData.type}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Deluxe Suite, Standard Room"
                      />
                      {roomTypeFormErrors.type && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.type}</p>}
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        max="20"
                        value={roomTypeFormData.capacity}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.capacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Number of guests (1-20)"
                      />
                      {roomTypeFormErrors.capacity && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.capacity}</p>}
                    </div>

                    {/* Daily Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Rate ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="daily_rate"
                        min="0"
                        step="0.01"
                        value={roomTypeFormData.daily_rate}
                        onChange={handleRoomTypeFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          roomTypeFormErrors.daily_rate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Price per night"
                      />
                      {roomTypeFormErrors.daily_rate && <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.daily_rate}</p>}
                    </div>

                    {/* Amenities */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities
                      </label>
                      <input
                        type="text"
                        name="amenities"
                        value={roomTypeFormData.amenities}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., WiFi, TV, Mini Bar, Air Conditioning"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={roomTypeFormData.description}
                        onChange={handleRoomTypeFormChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe this room type..."
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type Photo
                      </label>
                      
                      {!photoPreview ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragging 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="file"
                            id="photoUploadEdit"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <label htmlFor="photoUploadEdit" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              <Upload className="w-12 h-12 text-gray-400" />
                              <p className="text-gray-600 font-medium">
                                Drag and drop an image here, or click to select
                              </p>
                              <p className="text-gray-400 text-sm">
                                Supports: JPG, PNG, GIF (max 10MB - auto-compressed)
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Room type preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      
                      {roomTypeFormErrors.photo && (
                        <p className="text-red-500 text-xs mt-1">{roomTypeFormErrors.photo}</p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditRoomTypeModal(false);
                        setSelectedRoomType(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loadingRoomTypes}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRoomTypes}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loadingRoomTypes ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Room Type
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Type Confirmation Modal */}
        {showDeleteRoomTypeConfirmModal && selectedRoomType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Room Type
                </h2>
                
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete this room type? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRoomType.type}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedRoomType.capacity} guests</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Daily Rate:</span>
                    <span className="text-sm font-medium text-green-600">${selectedRoomType.daily_rate}/night</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Associated Rooms:</span>
                    <span className={`text-sm font-medium ${selectedRoomType.room_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedRoomType.room_count || 0} rooms
                    </span>
                  </div>
                </div>

                {selectedRoomType.room_count > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm">
                    ⚠️ Warning: This room type has {selectedRoomType.room_count} associated room{selectedRoomType.room_count !== 1 ? 's' : ''}. You cannot delete it until all rooms are removed or reassigned.
                  </div>
                )}

                {roomTypeSubmitMessage.text && roomTypeSubmitMessage.type === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
                    {roomTypeSubmitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDeleteRoomType}
                    disabled={loadingRoomTypes}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteRoomType}
                    disabled={loadingRoomTypes || selectedRoomType.room_count > 0}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingRoomTypes ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
