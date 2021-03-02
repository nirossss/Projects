import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

const AdminChart = (props) => {
    const { vacations, myIo, closeChart } = props
    const [vacationsArr, setVacationsArr] = useState([])
    const [followersArr, setFollowersArr] = useState([])

    useEffect(() => {
        let vacationsReplica = [...vacations]

        chartDataConstructor(vacationsReplica)

        myIo.current.on('push_follow', (data) => {
            vacationsReplica.forEach((item, index) => {
                if (data.vacationId === item.id) {
                    vacationsReplica.splice(index, 1, { ...item, followers: data.followers })
                }
            })
            chartDataConstructor(vacationsReplica)
        }); // Chart changes REAL TIME When vacations have new followers

        return closeChart
    }, [vacations, myIo, closeChart])

    const chartDataConstructor = (realVacations) => {
        let vacationsArrReplica = []
        let followersArrReplica = []

        realVacations.forEach(item => {
            if (item.followers > 0) {
                vacationsArrReplica.push(`(#${item.id}): ${item.destination}`)
                followersArrReplica.push(item.followers)
            }
        })
        setVacationsArr(vacationsArrReplica)
        setFollowersArr(followersArrReplica)
    }

    return (
        <div>
            <h2>Live Followers Report</h2>
            <Bar
                data={{
                    labels: vacationsArr,
                    datasets: [
                        {
                            label: 'Followers',
                            backgroundColor: 'rgba(255,99,132,0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                            hoverBorderColor: 'rgba(255,99,132,1)',
                            data: followersArr
                        }
                    ]
                }}
                width={100}
                height={200}
                options={{
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                min: 0,
                                stepSize: 1
                            }
                        }]
                    }
                }}
            />
            <button className="btn btn-outline-danger" onClick={closeChart}>Close</button>
            <hr />
        </div>
    )
}

export default AdminChart