import { describe, expect, it } from "vitest";
import { GET as getCustomers } from "../customers/route";
import { GET as getFleet } from "../fleet/route";
import { GET as getMission } from "./[id]/route";
import { GET as getMissions } from "./route";

describe("GET /api/missions", () => {
  it("returns the board in window order", async () => {
    const response = await getMissions();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.missions).toHaveLength(12);
    expect(body.missions[0].id).toBe("DC-1042");
    expect(body.missions[0].customerName).toBe("Helios Bio");
    expect(body.missions[0].vehicleName).toBe("Skiff-4");
    const windows = body.missions.map((mission: { windowStart: string }) => mission.windowStart);
    expect(windows).toEqual([...windows].sort((a, b) => a.localeCompare(b)));
  });
});

describe("GET /api/missions/:id", () => {
  it("returns the mission with customer, vehicle, and events", async () => {
    const response = await getMission(new Request("http://localhost/api/missions/DC-1056"), {
      params: Promise.resolve({ id: "DC-1056" }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.mission.id).toBe("DC-1056");
    expect(body.mission.delayMinutes).toBe(40);
    expect(body.mission.customer.name).toBe("Kite & Cable");
    expect(body.mission.vehicle.name).toBe("Hopper-2");
    expect(body.mission.events.length).toBeGreaterThanOrEqual(3);
  });

  it("returns not_found for an unknown id", async () => {
    const response = await getMission(new Request("http://localhost/api/missions/DC-0000"), {
      params: Promise.resolve({ id: "DC-0000" }),
    });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  });
});

describe("GET /api/fleet", () => {
  it("returns the four vehicles", async () => {
    const response = await getFleet();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.vehicles).toHaveLength(4);
    expect(body.vehicles.find((vehicle: { id: string }) => vehicle.id === "mule-9").nextMissionId).toBeNull();
  });
});

describe("GET /api/customers", () => {
  it("returns open mission counts", async () => {
    const response = await getCustomers();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.customers).toHaveLength(6);
    expect(body.customers.find((customer: { id: string }) => customer.id === "brine-works").openMissionCount).toBe(2);
  });
});
