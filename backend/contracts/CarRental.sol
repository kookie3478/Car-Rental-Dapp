// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarRental {
    uint256 public carCount;

    /* -------------------- ENUMS -------------------- */

    enum CarStatus {
        Available,     // 0 → visible & editable
        Rented,        // 1 → currently rented
        Unavailable    // 2 → servicing / deleted
    }

    /* -------------------- STRUCTS -------------------- */

    struct Car {
        uint256 id;
        address owner;
        string model;
        string pickupLocation;
        uint256 pricePerDay; // wei
        CarStatus status;
        uint256 earnings;
    }

    struct Rental {
        uint256 carId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        uint256 paid;
        bool active;
    }

    /* -------------------- STORAGE -------------------- */

    mapping(uint256 => Car) public cars;

    // One active rental per car
    mapping(uint256 => Rental) public activeRental;

    // History
    mapping(address => Rental[]) private renterHistory;
    mapping(address => Rental[]) private ownerHistory;

    /* -------------------- EVENTS -------------------- */

    event CarRegistered(uint256 indexed carId, address indexed owner);
    event CarUpdated(uint256 indexed carId);
    event CarUnavailable(uint256 indexed carId);
    event CarRented(
        uint256 indexed carId,
        address indexed renter,
        uint256 startDate,
        uint256 endDate,
        uint256 paid
    );
    event RentalCancelled(
        uint256 indexed carId,
        address indexed renter,
        uint256 refunded
    );
    event RentalEnded(uint256 indexed carId);

    /* -------------------- OWNER FUNCTIONS -------------------- */

    function registerCar(
        string memory _model,
        string memory _pickupLocation,
        uint256 _pricePerDay
    ) external {
        require(_pricePerDay > 0, "Invalid price");

        carCount++;

        cars[carCount] = Car({
            id: carCount,
            owner: msg.sender,
            model: _model,
            pickupLocation: _pickupLocation,
            pricePerDay: _pricePerDay,
            status: CarStatus.Available,
            earnings: 0
        });

        emit CarRegistered(carCount, msg.sender);
    }

    /// SAVE button → update price or pickup location
    function updateCarDetails(
        uint256 _carId,
        string memory _pickupLocation,
        uint256 _pricePerDay
    ) external {
        Car storage car = cars[_carId];
        require(car.owner == msg.sender, "Only owner");
        require(car.status == CarStatus.Available, "Car not editable");
        require(_pricePerDay > 0, "Invalid price");

        car.pickupLocation = _pickupLocation;
        car.pricePerDay = _pricePerDay;

        emit CarUpdated(_carId);
    }

    /// UNAVAILABLE / DELETE button (when not rented)
    function setCarUnavailable(uint256 _carId) external {
        Car storage car = cars[_carId];
        require(car.owner == msg.sender, "Only owner");
        require(car.status == CarStatus.Available, "Car cannot be disabled");

        car.status = CarStatus.Unavailable;

        emit CarUnavailable(_carId);
    }

    /// UNAVAILABLE when car is already rented → refund renter
    function cancelRental(uint256 _carId) external {
        Car storage car = cars[_carId];
        require(car.owner == msg.sender, "Only owner");
        require(car.status == CarStatus.Rented, "Car not rented");

        Rental storage r = activeRental[_carId];
        require(r.active, "No active rental");

        r.active = false;
        car.status = CarStatus.Unavailable;

        payable(r.renter).transfer(r.paid);

        emit RentalCancelled(_carId, r.renter, r.paid);
    }

    /// Normal rental completion
    function endRental(uint256 _carId) external {
        Car storage car = cars[_carId];
        require(car.owner == msg.sender, "Only owner");
        require(car.status == CarStatus.Rented, "Not rented");

        Rental storage r = activeRental[_carId];
        require(block.timestamp >= r.endDate, "Rental still active");

        r.active = false;
        car.status = CarStatus.Available;

        emit RentalEnded(_carId);
    }

    /* -------------------- RENTER FUNCTIONS -------------------- */

    function rentCar(
        uint256 _carId,
        uint256 _startDate,
        uint256 _endDate
    ) external payable {
        Car storage car = cars[_carId];

        require(car.status == CarStatus.Available, "Car not available");
        require(_endDate > _startDate, "Invalid dates");

        uint256 daysRented = (_endDate - _startDate) / 1 days;
        require(daysRented > 0, "Minimum 1 day");

        uint256 totalCost = daysRented * car.pricePerDay;
        require(msg.value == totalCost, "Incorrect ETH sent");

        car.status = CarStatus.Rented;
        car.earnings += msg.value;

        Rental memory rental = Rental({
            carId: _carId,
            renter: msg.sender,
            startDate: _startDate,
            endDate: _endDate,
            paid: msg.value,
            active: true
        });

        activeRental[_carId] = rental;
        renterHistory[msg.sender].push(rental);
        ownerHistory[car.owner].push(rental);

        payable(car.owner).transfer(msg.value);

        emit CarRented(
            _carId,
            msg.sender,
            _startDate,
            _endDate,
            msg.value
        );
    }

    /* -------------------- VIEW FUNCTIONS -------------------- */

    function getRenterHistory(address user)
        external
        view
        returns (Rental[] memory)
    {
        return renterHistory[user];
    }

    function getOwnerHistory(address user)
        external
        view
        returns (Rental[] memory)
    {
        return ownerHistory[user];
    }
}
