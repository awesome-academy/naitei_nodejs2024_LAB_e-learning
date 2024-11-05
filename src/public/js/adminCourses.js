function showViewSections(courseId) {
  fetch(`/admins/courses/${courseId}/sections`)
    .then(response => response.json())
    .then(sections => {
    const sectionTableBody = document.getElementById('sectionTableBody');
    sectionTableBody.innerHTML = ''; // Clear existing rows
    sections.forEach((section, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${section.id}</td>
        <td>${section.name}</td>
        <td>${section.description}</td>
        `;
        sectionTableBody.appendChild(row);
    });
    document.getElementById('viewSectionsModal').classList.remove('hidden');
  })
    .catch(error => console.error('Error:', error));
}

function hideViewSections() {
  document.getElementById('viewSectionsModal').classList.add('hidden');
}

function showViewLessons(sectionId) {
  fetch(`/admins/sections/${sectionId}/lessons`)
    .then(response => response.json())
    .then(lessons => {
    const lessonTableBody = document.getElementById('lessonTableBody');
    lessonTableBody.innerHTML = ''; // Clear existing rows
    lessons.forEach((lesson, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${lesson.id}</td>
        <td>${lesson.name}</td>
        <td>${lesson.description}</td>
        `;
        lessonTableBody.appendChild(row);
    });
    document.getElementById('viewLessonsModal').classList.remove('hidden');
  })
  .catch(error => console.error('Error:', error));
}

function hideViewLessons() {
  document.getElementById('viewLessonsModal').classList.add('hidden');
}