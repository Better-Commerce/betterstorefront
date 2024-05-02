const MembershipPromotionCard = ({ moneySaved, defaultDisplayMembership, lowestMemberShipPrice, currencySymbol, setOpenOMM }:any) => {
  const handleOptMembershipModal = () => {
    setOpenOMM(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-2 text-center">
      <div className="flex items-center justify-center">
        <img src="/theme/blue/image/logo.png?fm=webp&amp;h=200" width="60" height="60" alt="Store" className="brand-logo" />
      </div>
      <div className="mt-4">
        <p className="font-bold text-lg">
          <span className="text-red-700"> {!!moneySaved && `SAVE ${moneySaved}`} </span>
          <span className="text-indigo-900"> {defaultDisplayMembership?.membershipPromoDiscountPerc}% OFF ON THIS ORDER</span>
        </p>
        <p className="text-gray-600 mt-2">
          {`Get ${defaultDisplayMembership?.membershipPromoDiscountPerc}% OFF, unlimited FREE delivery and unique offers all year round!*`}
        </p>
        <p className="text-gray-600 mt-2">
          {!!(lowestMemberShipPrice >= 0) && `Membership starts from ${currencySymbol}${lowestMemberShipPrice} per annum `}
        </p>
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={handleOptMembershipModal} className="flex items-center justify-center btn btn-secondary w-full !font-medium">
          Join now
        </button>
      </div>
    </div>
  );
};

export default MembershipPromotionCard;
