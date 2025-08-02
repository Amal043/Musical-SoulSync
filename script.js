const apiKey = 'AIzaSyD1fteD82CRvxzORnzWaTxFZw8hQI992PI'; // Replace with your API key

function searchSongs() {
  const type = document.getElementById('searchType').value;
  const query = document.getElementById('searchInput').value.trim();
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (!type || !query) {
    results.innerHTML = '<p>Please select a search type and enter a search query.</p>';
    return;
  }

  let searchQuery = '';
  if (type === 'writer') searchQuery = `songs written by ${query}`;
  else if (type === 'singer') searchQuery = `songs by singer ${query}`;
  else if (type === 'song') searchQuery = `${query} normal slowed reverb`;

  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoEmbeddable=true&maxResults=15&key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = '';
      const items = data.items.filter(item => !/short/i.test(item.snippet.title));

      if (items.length === 0) {
        results.innerHTML = '<p>No suitable results found (shorts excluded).</p>';
        return;
      }

      items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';

        const songDiv = document.createElement('div');
        songDiv.classList.add('song-item');

        const titleP = document.createElement('p');
        titleP.textContent = title;

        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-playlist';
        addBtn.textContent = '+ Add to Playlist';
        addBtn.onclick = () => addToPlaylist(videoId, title);

        songDiv.appendChild(titleP);
        songDiv.appendChild(iframe);
        songDiv.appendChild(addBtn);
        results.appendChild(songDiv);
      });
    })
    .catch(err => {
      console.error(err);
      results.innerHTML = '<p>Error fetching videos. Check your API key or internet connection.</p>';
    });
}

// Playlist handling with LocalStorage
function loadPlaylists() {
  const playlists = JSON.parse(localStorage.getItem('playlists')) || {};
  const selector = document.getElementById('playlistSelector');
  selector.innerHTML = '';
  for (const name in playlists) {
    const option = document.createElement('option');
    option.value = name;
    option.text = name;
    selector.appendChild(option);
  }
  displayPlaylist();
}

function createPlaylist() {
  const name = prompt("Enter playlist name:");
  if (!name) return;

  const playlists = JSON.parse(localStorage.getItem('playlists')) || {};
  if (playlists[name]) {
    alert("Playlist already exists.");
    return;
  }

  playlists[name] = [];
  localStorage.setItem('playlists', JSON.stringify(playlists));
  loadPlaylists();
}

function deletePlaylist() {
  const name = document.getElementById('playlistSelector').value;
  if (!name) return;

  const playlists = JSON.parse(localStorage.getItem('playlists'));
  delete playlists[name];
  localStorage.setItem('playlists', JSON.stringify(playlists));
  loadPlaylists();
}

function addToPlaylist(videoId, title) {
  const name = document.getElementById('playlistSelector').value;
  if (!name) {
    alert("Please select a playlist first.");
    return;
  }

  const playlists = JSON.parse(localStorage.getItem('playlists'));
  playlists[name].push({ videoId, title });
  localStorage.setItem('playlists', JSON.stringify(playlists));
  displayPlaylist();
}

function displayPlaylist() {
  const name = document.getElementById('playlistSelector').value;
  const list = document.getElementById('playlistSongs');
  list.innerHTML = '';
  if (!name) return;

  const playlists = JSON.parse(localStorage.getItem('playlists'));
  playlists[name].forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      🎵 ${song.title}
      <button onclick="removeFromPlaylist('${name}', ${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

function removeFromPlaylist(name, index) {
  const playlists = JSON.parse(localStorage.getItem('playlists'));
  playlists[name].splice(index, 1);
  localStorage.setItem('playlists', JSON.stringify(playlists));
  displayPlaylist();
}

window.onload = loadPlaylists;


let lastNoteTime = 0;
const noteCooldown = 220; // milliseconds between notes (increase to reduce)

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastNoteTime < noteCooldown) return; // limit frequency
    lastNoteTime = now;

    const note = document.createElement('span');
    note.classList.add('floating-note');
    note.innerText = ['🎵', '🎶', "🎷", "🎸", "🎺", "🎻","🎤"][Math.floor(Math.random() * 7)];

    note.style.left = e.clientX + 'px';
    note.style.top = e.clientY + 'px';

    document.body.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 2000);
});




