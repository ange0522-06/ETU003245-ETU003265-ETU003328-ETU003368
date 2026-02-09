import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import DetailsPanel from "./DetailsPanel";
import { getSignalementsApi } from "./api";
import { useProfile } from "./ProfileContext";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "termine":
    case "terminé":
      return "#4caf50";
    case "en_cours":
    case "en cours":
      return "#ffc107";
    case "nouveau":
      return "#2196f3";
    default:
      return "#9e9e9e";
  }
};

const createCustomIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50%;
          opacity: 0.85;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          top: 10px;
          left: 10px;
        "></div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function Map() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);

  // 🔥 Détection réelle navigateur
  const [isOnlineMap, setIsOnlineMap] = useState(navigator.onLine);

  const { profile } = useProfile();

  // 🎯 Ecoute des changements réseau
  useEffect(() => {
    const handleOnline = () => setIsOnlineMap(true);
    const handleOffline = () => setIsOnlineMap(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 📌 Chargement des signalements (backend local)
  useEffect(() => {
    setLoading(true);
    setError("");

    getSignalementsApi(localStorage.getItem("token"))
      .then((data) => {
        setPoints(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement des points");
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="map-page">
      <div className="page-header">
        <h1 className="page-title">🗺️ Carte des travaux</h1>
        <p className="page-subtitle">
          Visualisation géographique des travaux routiers
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
          justifyContent: "center",
          margin: "0 auto",
          maxWidth: "1400px",
        }}
      >
        {/* 🗺️ CARTE */}
        <div
          className="content-container"
          style={{
            flex: 1,
            minWidth: 350,
            minHeight: 600,
            maxWidth: 800,
            position: "relative",
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              Chargement des points...
            </div>
          )}

          {error && (
            <div style={{ color: "red", textAlign: "center" }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {!isOnlineMap && (
                <div
                  style={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    background: "#ff9800",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    color: "white",
                    zIndex: 1000,
                  }}
                >
                  Mode Offline
                </div>
              )}

              <MapContainer
                center={[-18.8792, 47.5079]}
                zoom={13}
                style={{ height: 560, width: "100%", borderRadius: "12px" }}
              >
                <TileLayer
                  key={isOnlineMap ? "online" : "offline"} // 🔥 FORCE le reload
                  url={
                    isOnlineMap
                      ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      : "http://localhost:8085/styles/basic/{z}/{x}/{y}.png"
                    // ⚠️ Si React est dans Docker :
                    // "http://tileserver:8080/styles/basic/{z}/{x}/{y}.png"
                  }
                  attribution="&copy; OpenStreetMap contributors"
                />

                {points.map((pt) => (
                  <Marker
                    key={pt.id}
                    position={[pt.latitude, pt.longitude]}
                    icon={createCustomIcon(getStatusColor(pt.status))}
                    eventHandlers={{
                      click: () => setSelectedPoint(pt),
                      mouseover: (e) => e.target.openPopup(),
                      mouseout: (e) => e.target.closePopup(),
                    }}
                  >
                    <Popup>
                      <div style={{ padding: 10 }}>
                        <strong>{pt.titre || "Travaux routier"}</strong>
                        <br />
                        Status :
                        <b style={{ color: getStatusColor(pt.status) }}>
                          {" "}{pt.status}
                        </b>
                        <br />
                        Date : {pt.date || "-"} <br />
                        Surface : {pt.surface || "-"} m² <br />
                        Budget : {pt.budget || "-"} Ar <br />
                        Entreprise : {pt.entreprise || "-"}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </>
          )}
        </div>

        {/* 📋 DETAILS */}
        <div
          className="content-container"
          style={{
            width: 380,
            minWidth: 320,
            minHeight: 600,
            padding: 20,
          }}
        >
          <DetailsPanel point={selectedPoint} />
        </div>
      </div>
    </div>
  );
}
