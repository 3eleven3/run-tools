import { makeAutoObservable } from "mobx";

type Activity = {
	"Activity Type": string;
	"Aerobic TE": string;
	"Avg GAP": string;
	"Avg Ground Contact Time": string;
	"Avg HR": string;
	"Avg Pace": string;
	"Avg Power": string;
	"Avg Run Cadence": string;
	"Avg Stride Length": string;
	"Avg Vertical Oscillation": string;
	"Avg Vertical Ratio": string;
	"Best Lap Time": string;
	"Best Pace": string;
	"Body Battery Drain": string;
	Calories: string;
	Date: string;
	Decompression: string;
	Distance: string;
	"Elapsed Time": string;
	Favorite: string;
	"Max Avg Power (20 min)": string;
	"Max Elevation": string;
	"Max HR": string;
	"Max Power": string;
	"Max Run Cadence": string;
	"Max Temp": string;
	"Min Elevation": string;
	"Min Temp": string;
	"Moving Time": string;
	"Normalized Power® (NP®)": string;
	"Number of Laps": string;
	"Rest Time": string;
	Steps: string;
	Time: string;
	Title: string;
	"Total Ascent": string;
	"Total Descent": string;
	"Total Reps": string;
	"Total Sets": string;
	"Total Strokes": string;
	"Training Stress Score®": string;
};

export class Data {
	activities: Array<Activity>;
	filters: {
		years: Array<string> | null;
		activityTypes: Array<string> | null;
	} = {
		years: null,
		activityTypes: null,
	};

	constructor(activities: Array<unknown>) {
		makeAutoObservable(this);

		console.log(activities);

		this.activities = activities as Array<Activity>;
	}

	get activityCount() {
		return this.activities.length;
	}

	get activityYears() {
		const years: Record<string, number> = {};
		this.activities.forEach((activity) => {
			const year = new Date(activity.Date).getFullYear();
			if (!years[year]) {
				years[year] = 0;
			}
			years[year]++;
		});
		return years;
	}

	get filteredActivities() {
		return this.activities.filter((activity) => {
			const year = new Date(activity.Date).getFullYear().toString();
			const activityType = activity["Activity Type"];
			if (this.filters.years && !this.filters.years.includes(year)) {
				return false;
			}
			if (
				this.filters.activityTypes &&
				!this.filters.activityTypes.includes(activityType)
			) {
				return false;
			}
			return true;
		});
	}

	private getIsoWeek(date: Date) {
		const d = new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
		);
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	}

	get filteredActivitiesForDistanceCharts() {
		return this.filteredActivities
			.filter((activity) => {
				const type = activity["Activity Type"];
				return type === "Running" || type === "Virtual Running";
			})
			.map((activity) => {
				const date = new Date(activity.Date);
				return {
					week: date.toISOString().slice(0, 10),
					miles: parseFloat(activity.Distance) || 0,
				};
			})
			.sort((a, b) => a.week.localeCompare(b.week));
	}

	get filteredCumulativeMilesByYear() {
		const running = this.filteredActivities.filter((activity) => {
			const type = activity["Activity Type"];
			return type === "Running" || type === "Virtual Running";
		});

		const milesByYearWeek: Record<string, Record<number, number>> = {};

		running.forEach((activity) => {
			const date = new Date(activity.Date);
			const year = date.getFullYear().toString();
			const week = this.getIsoWeek(date);
			const miles = parseFloat(activity.Distance) || 0;

			if (!milesByYearWeek[year]) {
				milesByYearWeek[year] = {};
			}

			milesByYearWeek[year][week] = (milesByYearWeek[year][week] ?? 0) + miles;
		});

		const years = Object.keys(milesByYearWeek).sort();
		if (years.length === 0) {
			return { years: [], data: [] };
		}

		const allWeeks = new Set<number>();
		Object.values(milesByYearWeek).forEach((weeks) => {
			Object.keys(weeks).forEach((week) => allWeeks.add(Number(week)));
		});

		const maxWeek = allWeeks.size === 0 ? 0 : Math.max(...Array.from(allWeeks));
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear().toString();
		const currentWeek = this.getIsoWeek(currentDate);
		const cumulative: Record<string, number> = {};

		const data: Array<Record<string, unknown>> = [];
		for (let week = 1; week <= maxWeek; week++) {
			const point: Record<string, unknown> = { week: `W${week}` };
			years.forEach((year) => {
				const weekMiles = milesByYearWeek[year][week] ?? 0;
				cumulative[year] = (cumulative[year] ?? 0) + weekMiles;
				if (year === currentYear && week > currentWeek) {
					point[year] = null;
				} else {
					point[year] = cumulative[year];
				}
			});
			data.push(point);
		}

		return { years, data };
	}

	get filteredActivityDistanceStats() {
		const data = this.filteredActivitiesForDistanceCharts;
		if (data.length === 0) {
			return { avg: 0, max: 0 };
		}

		const avg = data.reduce((sum, item) => sum + item.miles, 0) / data.length;
		const max = Math.max(...data.map((item) => item.miles));

		return { avg, max };
	}
}
