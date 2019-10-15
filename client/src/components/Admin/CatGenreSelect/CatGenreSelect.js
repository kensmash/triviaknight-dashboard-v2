import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRES from "../../../queries/categoryGenres";

const CatGenreSelect = props => {
  const { loading, error, data } = useQuery(QUERY_CATEGORYGENRES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;
  let categoryGenres = data.categoryGenres.map(item => ({
    value: item._id,
    label: item.name,
    categorytypes: item.categorytypes
  }));
  if (props.categorytype !== null) {
    categoryGenres = categoryGenres.filter(genre =>
      genre.categorytypes.some(type => type._id === props.categorytype)
    );
  }

  return (
    <Dropdown
      placeholder={props.placeholder}
      value={props.value}
      search
      selection
      multiple
      onChange={props.catGenreSelectHandler}
      options={categoryGenres}
    />
  );
};

CatGenreSelect.propTypes = {
  value: PropTypes.array,
  placeholder: PropTypes.string.isRequired,
  categorytype: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  catGenreSelectHandler: PropTypes.func
};

export default CatGenreSelect;
