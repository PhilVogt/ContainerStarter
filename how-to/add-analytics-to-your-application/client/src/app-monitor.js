import { send } from "./kibana-poster.js";

export class AppMonitor {
    username = "";
    currentAppIdentity = {};
    token = 0;
    pollInterval = 10000;

    constructor(pollInterval) {
        debugger;
        this.currentAppIdentity = fin.me.identity;

        if (pollInterval > 10000) {
            this.pollInterval = pollInterval;
        }
    }

    formatDate(date) {
        let formattedDate = `${date.getFullYear().toString().padStart(4, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        console.log(formattedDate);
        return formattedDate;
    }

    formatBytes(size, places) {
        let KB = 1024;
        let MB = KB * 1024;
        let GB = MB * 1024;

        if (size > GB) {
            return (size / GB).toFixed(places) + "GB";
        } else if (size > MB) {
            return (size / MB).toFixed(places) + "MB";
        } else if (size > KB) {
            return (size / KB).toFixed(places) + "KB";
        } else if (size === 0) {
            return "0";
        } else {
            return size.toFixed(1) + "B";
        }
    }

    async getAppStats() {
        let list = await fin.System.getAllProcessInfo();
        let currentApp = list.apps.find(
            (entry) => entry.uuid === fin.me.identity.uuid
        );

        if (currentApp !== undefined && currentApp !== null) {
            var primeNumberCalculator = currentApp.entities.find(
                (entry) => entry.name === "prime_number_calculator"
            );

            let cpu = primeNumberCalculator.cpuUsage;
            let memory = primeNumberCalculator.workingSetSize;
            return { cpu, memory };
        }

        return null;
    }

    createMessagePayload(additionalData) {
        return {
            timestamp: this.formatDate(new Date()), // 'yyyy/MM/DD HH:mm:ss' This is a format that Elastic will automatically recognise as a Date
            username: this.username,
            uuid: this.currentAppIdentity.uuid,
            ...additionalData,
        };
    }

    async sendRvmDetails() {
        const rvmDetails = await fin.System.getRvmInfo();
        send(this.createMessagePayload(rvmDetails));
    }

    async sendCpuAndMemory() {
        const cpuAndMemoryDetails = await this.getAppStats();
        send(this.createMessagePayload(cpuAndMemoryDetails));
    }

    async startMonitoring() {
        if (this.token === 0) {
            this.username = await fin.System.getEnvironmentVariable("username"); // Use auth identify here dont do this!
            this.sendRvmDetails();
            this.token = setInterval(() => {
                this.sendCpuAndMemory();
            }, this.pollInterval);
        }
    }

    stopMonitoring() {
        if (this.token !== 0) {
            clearInterval(token);
        }
    }
}
