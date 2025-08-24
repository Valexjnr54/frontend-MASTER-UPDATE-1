export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  assigned_to: number; // project_manager_id
  status: 'Pending' | 'In Progress' | 'Completed';
}
export interface NavLink {
  label: string;
  href: string;
  subLinks?: NavLink[];
}

export interface ThematicArea {
  id: number;
  title: string;
  image: string;
  stories: {
    title: string;
    icon: string;
    href: string;
  }[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

export interface Project {
  id: string;
  project_name: string;
  project_manager_id: number;
  project_manager_name?: string;
  task: string;
  start_date: string;
  end_date: string;
  target_entry: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  description?: string;
  created_at: string;
  updated_at: string;
  tasks?: ProjectTask[];
}

export interface ProjectManager {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  profile_image: string | null;
  project: Array<{
    id: number;
    project_name: string;
    project_manager_id: number;
    start_date: string;
    end_date: string;
    description: string;
    target_entry: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DataEntry {
  id: string;
  project: string;
  manager: string;
  date: string;
  beneficiary: string;
  category: string;
  value: string;
  status: string;
}

export interface CustomField {
  name: string;
  value: string;
}

export interface SubmittedData {
  id?: string
  project_id: number;
  project: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: CustomField[];
}

export interface MediaFile {
  file: File;
  type: 'image' | 'video' | 'file';
  previewUrl?: string;
  cloudinaryUrl?: string;
  uploading: boolean;
  error?: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  published: boolean;
  cover_image?: string;
  category_id: number;
  tag_id: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  tag?: Tag;
  comments?: Comment[];
}
