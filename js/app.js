/* ==========================================================
   DrivEx — Shared App Logic (storage, auth, utils, navbar)
   Include this on every page AFTER cars-data.js (if used)
   ========================================================== */

const LS_KEYS = {
  USER: "drivex_user",
  USERS: "drivex_users",
  BOOKINGS: "drivex_bookings",
  SELECTED_CAR: "drivex_selected_car",
  SEARCH: "drivex_search",
  CURRENT_BOOKING: "drivex_current_booking",
  SEEDED: "drivex_seeded"
};

const LS = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e){ console.error("Storage error:", e); return false; }
  },
  remove(key){ localStorage.removeItem(key); }
};

/* ---------------- Utilities ---------------- */
const Util = {
  qs(name){
    return new URLSearchParams(window.location.search).get(name);
  },
  money(n){
    return "$" + Number(n).toFixed(0);
  },
  daysBetween(d1, d2){
    const a = new Date(d1), b = new Date(d2);
    const diff = Math.round((b - a) / (1000*60*60*24));
    return diff > 0 ? diff : 1;
  },
  genId(prefix){
    return prefix + Math.floor(100000 + Math.random()*900000);
  },
  todayPlus(days){
    const d = new Date(); d.setDate(d.getDate()+days);
    return d.toISOString().slice(0,10);
  },
  formatDate(iso){
    if(!iso) return "";
    const d = new Date(iso);
    if(isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  },
  initials(name){
    if(!name) return "?";
    return name.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join("");
  },
  toast(message, type="success"){
    let holder = document.getElementById("drivexToastHolder");
    if(!holder){
      holder = document.createElement("div");
      holder.id = "drivexToastHolder";
      holder.style.position = "fixed";
      holder.style.top = "1rem";
      holder.style.right = "1rem";
      holder.style.zIndex = "2000";
      document.body.appendChild(holder);
    }
    const colors = { success:"#16a34a", danger:"#e0332a", info:"#4B2FE0" };
    const el = document.createElement("div");
    el.textContent = message;
    el.style.background = colors[type] || colors.info;
    el.style.color = "#fff";
    el.style.padding = ".75rem 1.25rem";
    el.style.borderRadius = "10px";
    el.style.marginTop = ".5rem";
    el.style.boxShadow = "0 10px 25px rgba(0,0,0,.15)";
    el.style.fontWeight = "600";
    el.style.fontFamily = "'Plus Jakarta Sans',sans-serif";
    el.style.fontSize = ".9rem";
    el.style.opacity = "0";
    el.style.transition = "opacity .25s ease, transform .25s ease";
    el.style.transform = "translateY(-8px)";
    holder.appendChild(el);
    requestAnimationFrame(()=>{ el.style.opacity="1"; el.style.transform="translateY(0)"; });
    setTimeout(()=>{
      el.style.opacity = "0";
      setTimeout(()=> el.remove(), 300);
    }, 3200);
  },

  // Reads an uploaded image file, shrinks it, and returns a compressed
  // base64 data URL (so we can safely store it in localStorage).
  resizeImageFile(file, maxWidth = 500, quality = 0.7){
    return new Promise((resolve, reject) => {
      if(!file){ resolve(null); return; }
      if(!file.type.startsWith("image/")){ reject(new Error("Please select an image file.")); return; }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read the file."));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not load the image."));
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
};

/* ---------------- Auth ----------------
   Real credential checking, all client-side via localStorage (BOM storage)
   and DOM updates. Two localStorage keys are involved:
     - LS_KEYS.USERS -> the "accounts table": [{name, email, password}, ...]
     - LS_KEYS.USER  -> the current logged-in session: {name, email}
------------------------------------------------------------------- */
const Auth = {
  // ----- session -----
  getUser(){ return LS.get(LS_KEYS.USER, null); },
  isLoggedIn(){ return !!this.getUser(); },
  logout(){ LS.remove(LS_KEYS.USER); },

  // ----- accounts -----
  getUsers(){ return LS.get(LS_KEYS.USERS, []); },
  saveUsers(users){ LS.set(LS_KEYS.USERS, users); },
  findUserByEmail(email){
    return this.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  // Create a new account. Fails if the email is already registered.
  register(name, email, password){
    if(this.findUserByEmail(email)){
      return { success:false, message:"An account with this email already exists. Please login instead." };
    }
    const users = this.getUsers();
    users.push({ name, email: email.trim(), password });
    this.saveUsers(users);

    LS.set(LS_KEYS.USER, { name, email: email.trim() }); // start session
    return { success:true, name };
  },

  // Check email + password against stored accounts.
  loginWithCredentials(email, password){
    const user = this.findUserByEmail(email);
    if(!user || user.password !== password){
      return { success:false, message:"Your email or password is incorrect. Please try again." };
    }
    LS.set(LS_KEYS.USER, { name:user.name, email:user.email });
    return { success:true, name:user.name };
  },

  requireAuth(redirectTo){
    if(!this.isLoggedIn()){
      const target = redirectTo || (window.location.pathname.split("/").pop());
      window.location.href = "login.html?redirect=" + encodeURIComponent(target);
      return false;
    }
    return true;
  }
};

// Seed one demo account so the site is usable immediately
function seedDemoUser(){
  if(!Auth.findUserByEmail("john.doe@email.com")){
    const users = Auth.getUsers();
    users.push({ name:"John Doe", email:"john.doe@email.com", password:"password123" });
    Auth.saveUsers(users);
  }
}

/* ---------------- Bookings ---------------- */
const Bookings = {
  getAll(){ return LS.get(LS_KEYS.BOOKINGS, []); },
  save(all){ LS.set(LS_KEYS.BOOKINGS, all); },
  add(booking){
    const all = this.getAll();
    all.unshift(booking);
    this.save(all);
    return booking;
  },
  getById(id){ return this.getAll().find(b => b.id === id); },
  updateStatus(id, status){
    const all = this.getAll();
    const idx = all.findIndex(b => b.id === id);
    if(idx > -1){ all[idx].status = status; this.save(all); }
    return all[idx];
  }
};

/* ---------------- Seed demo data (first run only) ---------------- */
function seedDemoData(){
  if(LS.get(LS_KEYS.SEEDED, false)) return;

  const demoBookings = [
    { id:"DRVX123456", carId:"c3", carName:"BMW 3 Series", pickup:"2024-05-20", ret:"2024-05-25",
      pickupLoc:"New York, USA", dropoffLoc:"Los Angeles, USA", status:"Upcoming", amount:375,
      customer:{ name:"John Doe", email:"john.doe@email.com", phone:"+1 234 567 8900" } },
    { id:"DRVX123457", carId:"c6", carName:"Toyota RAV4", pickup:"2024-04-10", ret:"2024-04-15",
      pickupLoc:"New York, USA", dropoffLoc:"New York, USA", status:"Completed", amount:320,
      customer:{ name:"John Doe", email:"john.doe@email.com", phone:"+1 234 567 8900" } },
    { id:"DRVX123458", carId:"c5", carName:"Audi A4", pickup:"2024-03-15", ret:"2024-03-20",
      pickupLoc:"New York, USA", dropoffLoc:"New York, USA", status:"Completed", amount:350,
      customer:{ name:"John Doe", email:"john.doe@email.com", phone:"+1 234 567 8900" } },
    { id:"DRVX123459", carId:"c4", carName:"Mercedes C-Class", pickup:"2024-02-12", ret:"2024-02-17",
      pickupLoc:"New York, USA", dropoffLoc:"New York, USA", status:"Cancelled", amount:280,
      customer:{ name:"John Doe", email:"john.doe@email.com", phone:"+1 234 567 8900" } }
  ];

  LS.set(LS_KEYS.BOOKINGS, demoBookings);
  LS.set(LS_KEYS.SEEDED, true);
}

/* ---------------- Navbar auth slot ---------------- */
function renderNavbarAuth(slotId){
  const slot = document.getElementById(slotId);
  if(!slot) return;
  const user = Auth.getUser();

  if(user){
    slot.innerHTML = `
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center gap-2 text-decoration-none dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:700;font-size:.8rem;">${Util.initials(user.name)}</div>
          <span class="fw-semibold small text-dark d-none d-md-inline">${user.name}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
          <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-grid-1x2-fill me-2"></i>Dashboard</a></li>
          <li><a class="dropdown-item" href="my-bookings.html"><i class="bi bi-calendar2-check me-2"></i>My Bookings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="navLogoutLink"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      </div>`;
    document.getElementById("navLogoutLink").addEventListener("click", (e)=>{
      e.preventDefault();
      Auth.logout();
      Util.toast("You have been logged out", "info");
      setTimeout(()=> window.location.href = "index.html", 600);
    });
  } else {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-brand-outline btn-sm me-2">Login</a>
      <a href="vehicles.html" class="btn btn-brand btn-sm">Book Now</a>`;
  }
}

/* Run seed once on every page load */
seedDemoData();
seedDemoUser();
