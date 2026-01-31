// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarRental {
    uint256 public carCount;

    // --------------------
    // STRUCTS
    // --------------------

    struct Car {
        uint256 id;
        address owner;
        string model;
        string pickupLocation;
        uint256 pricePerDay; // in wei
        bool isAvailable;
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

    // --------------------
    // STORAGE
    // --------------------

    mapping(uint256 => Car) public cars;

    // renter => rentals
    mapping(address => Rental[]) private renterHistory;

    // owner => rentals
    mapping(address => Rental[]) private ownerHistory;

    // --------------------
    // EVENTS
    // --------------------

    event CarRegistered(uint256 indexed carId, address indexed owner);
    event CarRented(
        uint256 indexed carId,
        address indexed renter,
        uint256 startDate,
        uint256 endDate,
        uint256 paid
    );
    event RentalEnded(uint256 indexed carId);

    // --------------------
    // OWNER FUNCTIONS
    // --------------------

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
            isAvailable: true,
            earnings: 0
        });

        emit CarRegistered(carCount, msg.sender);
    }

    function endRental(uint256 _carId) external {
        Car storage car = cars[_carId];
        require(car.owner == msg.sender, "Only owner");
        require(!car.isAvailable, "Car already available");

        car.isAvailable = true;

        // mark last rental as inactive
        Rental[] storage rentals = ownerHistory[msg.sender];
        require(rentals.length > 0, "No rentals");

        rentals[rentals.length - 1].active = false;

        emit RentalEnded(_carId);
    }

    // --------------------
    // RENTER FUNCTIONS
    // --------------------

    function rentCar(
        uint256 _carId,
        uint256 _startDate,
        uint256 _endDate
    ) external payable {
        Car storage car = cars[_carId];

        require(car.isAvailable, "Car not available");
        require(_endDate > _startDate, "Invalid dates");

        uint256 daysRented = (_endDate - _startDate) / 1 days;
        require(daysRented > 0, "Minimum 1 day");

        uint256 totalCost = daysRented * car.pricePerDay;
        require(msg.value == totalCost, "Incorrect ETH sent");

        // update car
        car.isAvailable = false;
        car.earnings += msg.value;

        Rental memory rental = Rental({
            carId: _carId,
            renter: msg.sender,
            startDate: _startDate,
            endDate: _endDate,
            paid: msg.value,
            active: true
        });

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

    // --------------------
    // VIEW FUNCTIONS
    // --------------------

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
