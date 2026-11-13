import { Project } from '../types/editor';
import { createInitialDemoProject } from '../constants/presets';

const STORAGE_KEY = 'cinematic_studio_projects_v1';
const CURRENT_PROJECT_KEY = 'cinematic_studio_current_id';

function readProjectsFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse projects from storage, resetting', e);
    return [];
  }
}

function writeProjectsToStorage(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to write projects to storage', e);
  }
}

export function getSavedProjects(): Project[] {
  const projects = readProjectsFromStorage();
  if (projects.length > 0) {
    return projects;
  }

  // First time initialization: create and save default initial project
  const demo = createInitialDemoProject();
  writeProjectsToStorage([demo]);
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, demo.id);
  } catch (e) {
    // Ignore storage quota
  }
  return [demo];
}

export function saveProject(project: Project): void {
  const projects = readProjectsFromStorage();
  const updated = { ...project, updatedAt: Date.now() };
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.unshift(updated);
  }

  writeProjectsToStorage(projects);
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
  } catch (e) {
    // Ignore storage quota
  }
}

export function getCurrentProject(): Project {
  const projects = getSavedProjects();
  try {
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (currentId) {
      const found = projects.find((p) => p.id === currentId);
      if (found) return found;
    }
  } catch (e) {
    // Ignore
  }
  return projects[0] || createInitialDemoProject();
}

export function duplicateProject(projectId: string): Project {
  const projects = getSavedProjects();
  const target = projects.find((p) => p.id === projectId);
  if (!target) {
    const fallback = createInitialDemoProject();
    saveProject(fallback);
    return fallback;
  }

  const cloned: Project = {
    ...target,
    id: 'proj-' + Date.now(),
    name: `${target.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveProject(cloned);
  return cloned;
}

export function deleteProject(projectId: string): Project[] {
  let projects = readProjectsFromStorage();
  projects = projects.filter((p) => p.id !== projectId);
  if (projects.length === 0) {
    projects = [createInitialDemoProject()];
  }
  writeProjectsToStorage(projects);
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, projects[0].id);
  } catch (e) {
    // Ignore
  }
  return projects;
}

export function exportProjectToJson(project: Project) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.name.replace(/[^a-z0-9]/gi, '_')}.cinematic`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importProjectFromJson(jsonString: string): Project {
  const parsed = JSON.parse(jsonString) as Project;
  if (!parsed.id || !parsed.tracks || !parsed.clips) {
    throw new Error('Invalid Cinematic Editor project file format');
  }
  parsed.id = 'proj-imported-' + Date.now();
  parsed.name = `${parsed.name} (Imported)`;
  saveProject(parsed);
  return parsed;
}
